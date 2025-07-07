import { DbErr } from '~/@/db/interface/error'
import { IMigrationPolicy } from '~/@/migration-policy/interface'
import { isErr, mapErr, Ok, Result, unwrapOr } from '~/@/result'
import { s } from '~/@/schema'
import { ascend } from '~/@/sort'
import { Sql } from '~/@/sql'
import { ISqlDb } from '~/@/sql-db/interface'
import { Sub } from '~/@/sub'
import { IDb } from '../../interface'
import { QueryInput } from '../../interface/query-input/query-input'
import { QueryOutput } from '../../interface/query-output/query-output'
import { toOrderBySql } from './order-by-sql'
import { quoteIfPostgresKeyword } from './postgres-keywords'
import { toWhereSql } from './where-sql'

export type Config<
  TEntity extends Record<string, unknown>,
  TRelated extends Record<string, unknown>,
  TRow extends Record<string, unknown>,
> = {
  t: 'sql-db'
  parser: IDb.Parser<TEntity, TRelated>
  sqlDb: ISqlDb
  viewName: string
  primaryKey: string
  migration?: {
    up: string[]
    down: string[]
    policy: IMigrationPolicy
  }
  entityKeyToSqlColumn: (key: keyof TEntity) => keyof TRow
  schema: s.Schema<TRow>
  rowToEntity: (row: TRow) => TEntity
  entityToRow: (entity: TEntity) => TRow
  getRelated: (entities: TEntity[]) => Promise<TRelated>
  computedColumnKeys?: (keyof TRow)[]
}

export const Db = <
  TEntity extends Record<string, unknown>,
  TRelated extends Record<string, unknown>,
  TRow extends Record<string, unknown>,
>(
  config: Config<TEntity, TRelated, TRow>,
): IDb.IDb<TEntity, TRelated> => {
  const run = config.migration?.policy.execute({
    sqlDb: config.sqlDb,
    up: config.migration.up,
    down: config.migration.down,
  })
  const mapOutput = (input: {
    queryInput: QueryInput<TEntity>
    related: TRelated
    dbOutput: Result<string, TRow[]>
  }): QueryOutput<TEntity, TRelated> => {
    const { queryInput, related, dbOutput } = input
    if (isErr(dbOutput)) return mapErr(dbOutput, DbErr.from)

    const entities = dbOutput.value.map(config.rowToEntity)
    const output: QueryOutput<TEntity, TRelated> = Ok({
      entities: {
        items: entities,
        total: entities.length,
        limit: queryInput.limit ?? 0,
        offset: queryInput.offset ?? 0,
      },
      related,
    })

    return output
  }

  const toSql = (
    queryInput: QueryInput<TEntity>,
  ): {
    sql: string
    vars: Sql.Vars
  } => {
    const vars: Sql.Vars = {
      limit: queryInput.limit,
      offset: queryInput.offset,
    }
    const whereClause = queryInput.where ? toWhereSql(queryInput.where, config.entityKeyToSqlColumn) : ''

    const orderByClause = queryInput.orderBy ? toOrderBySql(queryInput.orderBy, config.entityKeyToSqlColumn) : ''

    const sql = ['SELECT *', `FROM ${config.viewName}`, whereClause, orderByClause, 'LIMIT :limit', 'OFFSET :offset']
      .filter(Boolean)
      .join('\n')

    return {
      sql,
      vars,
    }
  }

  return {
    async query(queryInput) {
      await run
      const { sql, vars } = toSql(queryInput)
      const dbOutput = await config.sqlDb.query({ sql, vars: vars, schema: config.schema })
      const entities = unwrapOr(dbOutput, []).map(config.rowToEntity)

      const related = await config.getRelated(entities)
      const output = mapOutput({ queryInput, related, dbOutput })
      return output
    },

    liveQuery(queryInput) {
      const { sql, vars } = toSql(queryInput)
      return Sub.map(
        config.sqlDb.sub({ sql, vars, schema: config.schema }, (rows: TRow[]) => {
          const entities = rows.map(config.rowToEntity)
          return entities
        }),
        (entities: TEntity[]) => {
          // Return a sync result for now - the related data will be empty
          // In a real implementation, this would need to be handled differently
          const mockDbOutput = Ok(entities.map(config.entityToRow))
          return mapOutput({ queryInput, related: {} as TRelated, dbOutput: mockDbOutput })
        },
      )
    },

    async upsert(input) {
      await run

      if (input.entities.length === 0) {
        return Ok({ entities: [] })
      }

      const entity = input.entities[0]!
      const entries = Object.entries(entity)
      const sortedEntries = entries.sort(ascend(([key]) => key))
      const entityKeys = sortedEntries.map(([key]): keyof TEntity => key)

      const sqlColumns = entityKeys.flatMap((key): (keyof TRow)[] => {
        const sqlColumn = config.entityKeyToSqlColumn(key)
        if (!sqlColumn) return []
        const isComputedColumn = config.computedColumnKeys?.includes(sqlColumn)
        if (isComputedColumn) return []
        return [sqlColumn]
      })

      const values = input.entities
        .map((entity, index) => {
          config.entityToRow(entity)
          const placeholders = sqlColumns.map((column) => `:${String(column)}_${index}`)
          return `(${placeholders.join(', ')})`
        })
        .join(', ')

      const vars: Sql.Vars = {}
      input.entities.forEach((entity, index) => {
        const row = config.entityToRow(entity)
        sqlColumns.forEach((column) => {
          const columnStr = String(column)
          const value = row[column]
          vars[`${columnStr}_${index}`] = value as any
        })
      })

      const sql = `
INSERT INTO ${config.viewName} (
${sqlColumns.map((column) => `\t${quoteIfPostgresKeyword(column)}`).join(',\n')}
)
VALUES ${values}
ON CONFLICT (${config.primaryKey}) 
DO UPDATE SET
${sqlColumns.map((column) => `\t${quoteIfPostgresKeyword(column)} = EXCLUDED.${quoteIfPostgresKeyword(column)}`).join(',\n')}
`

      const queried = await config.sqlDb.query({ sql, vars, schema: s.unknown })

      if (isErr(queried)) return mapErr(queried, DbErr.from)

      return Ok({
        entities: input.entities,
      })
    },
  }
}

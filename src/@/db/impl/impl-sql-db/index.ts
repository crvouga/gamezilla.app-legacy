import { DbErr } from '~/@/db/interface/error'
import { ILogger } from '~/@/logger'
import { isErr, mapErr, Ok, Result, unwrapOr } from '~/@/result'
import { s } from '~/@/schema'
import { ascend } from '~/@/sort'
import { Sql } from '~/@/sql'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb } from '~/@/sql-db/interface'
import { Sub } from '~/@/sub'
import { IDb } from '../../interface'
import { QueryInput } from '../../interface/query-input/query-input'
import { QueryOutput } from '../../interface/query-output/query-output'
import { toOrderBySql } from './order-by-sql'
import { quoteIfKeyword } from './keywords'
import { toWhereSql } from './where-sql'

export type ImplSqlDb<
  TEntity extends Record<string, unknown>,
  TRelated extends Record<string, unknown>,
  TRow extends Record<string, unknown>,
> = {
  t: 'sql-db'
  parser: IDb.Parser<TEntity, TRelated>
  sqlDb: ISqlDb
  viewName: string
  primaryKey: string
  logger: ILogger
  migration?: {
    up: string[]
    down: string[]
    policy: ISqlDbMigrationPolicy
  }
  entityKeyToSqlColumn: (key: keyof TEntity) => keyof TRow
  schema: s.Schema<TRow>
  rowToEntity: (row: TRow) => TEntity
  entityToRow: (entity: TEntity) => TRow
  getRelated: (entities: TEntity[]) => Promise<TRelated>
  computedColumnKeys?: (keyof TRow)[]
}

const init = <
  TEntity extends Record<string, unknown>,
  TRelated extends Record<string, unknown>,
  TRow extends Record<string, unknown>,
>(
  self: ImplSqlDb<TEntity, TRelated, TRow>,
): IDb.IDb<TEntity, TRelated> => {
  const run = self.migration?.policy.execute({
    logger: self.logger,
    sqlDb: self.sqlDb,
    up: self.migration.up,
    down: self.migration.down,
  })
  const mapOutput = (input: {
    queryInput: QueryInput<TEntity>
    related: TRelated
    dbOutput: Result<string, TRow[]>
  }): QueryOutput<TEntity, TRelated> => {
    const { queryInput, related, dbOutput } = input
    if (isErr(dbOutput)) return mapErr(dbOutput, DbErr.from)

    const entities = dbOutput.value.map(self.rowToEntity)
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
    const whereClause = queryInput.where ? toWhereSql(queryInput.where, self.entityKeyToSqlColumn) : ''

    const orderByClause = queryInput.orderBy ? toOrderBySql(queryInput.orderBy, self.entityKeyToSqlColumn) : ''

    const sql = ['SELECT *', `FROM ${self.viewName}`, whereClause, orderByClause, 'LIMIT :limit', 'OFFSET :offset']
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
      const dbOutput = await self.sqlDb.query({ sql, vars: vars, schema: self.schema })
      const entities = unwrapOr(dbOutput, []).map(self.rowToEntity)

      const related = await self.getRelated(entities)
      const output = mapOutput({ queryInput, related, dbOutput })
      return output
    },

    liveQuery(queryInput) {
      const { sql, vars } = toSql(queryInput)
      return Sub.map(
        self.sqlDb.sub({ sql, vars, schema: self.schema }, (rows: TRow[]) => {
          const entities = rows.map(self.rowToEntity)
          return entities
        }),
        (entities: TEntity[]) => {
          // Return a sync result for now - the related data will be empty
          // In a real implementation, this would need to be handled differently
          const mockDbOutput = Ok(entities.map(self.entityToRow))
          return mapOutput({
            queryInput,
            related: {} as TRelated,
            dbOutput: mockDbOutput,
          })
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
        const sqlColumn = self.entityKeyToSqlColumn(key)
        if (!sqlColumn) return []
        const isComputedColumn = self.computedColumnKeys?.includes(sqlColumn)
        if (isComputedColumn) return []
        return [sqlColumn]
      })

      const values = input.entities
        .map((entity, index) => {
          self.entityToRow(entity)
          const placeholders = sqlColumns.map((column) => `:${String(column)}_${index}`)
          return `(${placeholders.join(', ')})`
        })
        .join(', ')

      const vars: Sql.Vars = {}
      input.entities.forEach((entity, index) => {
        const row = self.entityToRow(entity)
        sqlColumns.forEach((column) => {
          const columnStr = String(column)
          const value = row[column]
          vars[`${columnStr}_${index}`] = value as any
        })
      })

      const sql = `
INSERT INTO ${self.viewName} (
${sqlColumns.map((column) => `\t${quoteIfKeyword(column)}`).join(',\n')}
)
VALUES ${values}
ON CONFLICT (${self.primaryKey}) 
DO UPDATE SET
${sqlColumns.map((column) => `\t${quoteIfKeyword(column)} = EXCLUDED.${quoteIfKeyword(column)}`).join(',\n')}
`

      const queried = await self.sqlDb.query({ sql, vars, schema: s.unknown })

      if (isErr(queried)) return mapErr(queried, DbErr.from)

      return Ok({
        entities: input.entities,
      })
    },
  }
}

export const ImplSqlDb = {
  init,
}

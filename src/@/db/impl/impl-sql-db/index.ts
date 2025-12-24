import { DbErr } from '~/@/db/interface/error'
import { ILogger } from '~/@/logger'
import { isErr, mapErr, Ok, Result, unwrapOr } from '~/@/result'
import { s } from '~/@/schema'
import { ascend } from '~/@/sort'
import { Sql } from '~/@/sql'
import { MigrationPolicyResult, ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb } from '~/@/sql-db/interface'
import { Sub } from '~/@/sub'
import { IDb } from '../../interface'
import { QueryInput } from '../../interface/query-input/query-input'
import { QueryOutput } from '../../interface/query-output/query-output'
import { quoteIfKeyword } from './keywords'
import { MappingConfig } from './mapping-config'
import { toOrderBySql } from './order-by-sql'
import { toWhereSql } from './where-sql'

export type ImplSqlDb<
  TEntity extends Record<string, unknown>,
  TRelated extends Record<string, unknown>,
  TRow extends Record<string, unknown>,
> = MappingConfig<TEntity, TRow> & {
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
  schema: s.Schema<TRow>
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
  const run: Promise<MigrationPolicyResult> = self.migration
    ? self.migration.policy.execute({
        logger: self.logger,
        sqlDb: self.sqlDb,
        up: self.migration.up,
        down: self.migration.down,
      })
    : Promise.resolve({ t: 'skipped', reason: 'never-run' })

  const rowToEntity = (row: TRow): TEntity => {
    const rowEntries = Object.entries(row)
    const entityEntries = rowEntries.map(([sqlKey, sqlValue]) => [
      self.mapKeySqlToEntity[sqlKey],
      self.mapValueSqlToEntity[sqlKey]!(sqlValue as TRow[typeof sqlKey]),
    ])
    const entity = Object.fromEntries(entityEntries) as TEntity
    return entity
  }

  const entityToRow = (entity: TEntity): TRow => {
    const entityEntries = Object.entries(entity)
    const rowEntries = entityEntries.map(([entityKey, entityValue]) => [
      self.mapKeyEntityToSql[entityKey],
      self.mapValueEntityToSql[entityKey]!(entityValue as TEntity[typeof entityKey]),
    ])
    const row = Object.fromEntries(rowEntries) as TRow
    return row
  }

  const mapOutput = (input: {
    queryInput: QueryInput<TEntity>
    related: TRelated
    dbOutput: Result<string, TRow[]>
  }): QueryOutput<TEntity, TRelated> => {
    const { queryInput, related, dbOutput } = input
    if (isErr(dbOutput)) return mapErr(dbOutput, DbErr.from)

    const entities = dbOutput.value.map(rowToEntity)
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
    const vars: Sql.Vars = {}

    const whereClause = queryInput.where ? toWhereSql(queryInput.where, self) : ''

    const orderByClause = queryInput.orderBy ? toOrderBySql(queryInput.orderBy, self) : ''

    const limitClause = queryInput.limit ? 'LIMIT :limit' : ''
    if (limitClause) vars.limit = queryInput.limit

    const offsetClause = queryInput.offset ? 'OFFSET :offset' : ''
    if (offsetClause) vars.offset = queryInput.offset

    const sql = ['SELECT *', `FROM ${self.viewName}`, whereClause, orderByClause, limitClause, offsetClause]
      .filter(Boolean)
      .join('\n')

    return {
      sql,
      vars,
    }
  }

  return {
    extra: {},
    async query(queryInput) {
      await run
      const { sql, vars } = toSql(queryInput)
      const dbOutput = await self.sqlDb.query({ sql, vars: vars, schema: self.schema })
      const entities = unwrapOr(dbOutput, []).map(rowToEntity)

      const related = await self.getRelated(entities)
      const output = mapOutput({ queryInput, related, dbOutput })
      return output
    },

    async delete(_input) {
      return Ok({ entities: [] })
    },

    liveQuery(queryInput, map) {
      const { sql, vars } = toSql(queryInput)
      const subOut: Sub<QueryOutput<TEntity, TRelated>> = Sub.map(
        self.sqlDb.sub({ sql, vars, schema: self.schema }, (rows: TRow[]) => {
          const entities = rows.map(rowToEntity)
          return entities
        }),
        (entities: TEntity[]) => {
          // Return a sync result for now - the related data will be empty
          // In a real implementation, this would need to be handled differently
          const mockDbOutput = Ok(entities.map(entityToRow)) as Result<string, TRow[]>
          return mapOutput({
            queryInput,
            related: {} as TRelated,
            dbOutput: mockDbOutput,
          })
        },
      )

      return Sub.map(subOut, map)
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
        const sqlColumn = self.mapKeyEntityToSql[key]
        if (!sqlColumn) return []
        const isComputedColumn = self.computedColumnKeys?.includes(sqlColumn)
        if (isComputedColumn) return []
        return [sqlColumn]
      })

      const values = input.entities
        .map((_, index) => {
          const placeholders = sqlColumns.map((column) => `:${String(column)}_${index}`)
          return `(${placeholders.join(', ')})`
        })
        .join(', ')

      const vars: Sql.Vars = {}
      input.entities.forEach((entity, index) => {
        const row = entityToRow(entity)
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

    async update(input) {
      const whereSql = input.where ? toWhereSql(input.where, self) : null
      const setEntries = Object.entries(input.set)
      const setColumns = setEntries.flatMap(([key]): (keyof TRow)[] => {
        const sqlColumn = self.mapKeyEntityToSql[key as keyof TEntity]
        if (!sqlColumn) return []
        const isComputedColumn = self.computedColumnKeys?.includes(sqlColumn)
        if (isComputedColumn) return []
        return [sqlColumn]
      })

      const vars: Sql.Vars = {}
      setColumns.forEach((column) => {
        const value = entityToRow(input.set as TEntity)[column]
        vars[String(column)] = value as any
      })

      const sql = `
UPDATE ${self.viewName}
SET
${setColumns.map((column) => `\t${quoteIfKeyword(column)} = :${String(column)}`).join(',\n')}
WHERE ${self.primaryKey} IN (
  SELECT ${self.primaryKey} 
  FROM ${self.viewName}
  ${whereSql}
  ORDER BY ${self.primaryKey} ASC
  LIMIT ${input.limit}
  OFFSET ${input.offset}
)`

      const queried = await self.sqlDb.query({ sql, vars, schema: self.schema })

      if (isErr(queried)) return mapErr(queried, DbErr.from)

      return Ok(null)
    },
  }
}

export const ImplSqlDb = {
  init,
}

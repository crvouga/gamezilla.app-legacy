import { s } from '~/@/schema'
import { TimeSpan } from '~/@/time/time-span'
import { ILogger } from '../logger'
import { ImplStandardSql } from './impl-standard-sql'
import type { IMigratableSqlDb } from './interface'

export type ImplStandardSqlite = {
  t: 'standard-sqlite'
  query: <TRow>(sql: string, schema: s.Schema<TRow>) => Promise<unknown[]>
  logger: ILogger
  pollInterval?: TimeSpan
  garbageCollectionInterval?: TimeSpan
}

const init = (config: ImplStandardSqlite): IMigratableSqlDb => {
  const base = ImplStandardSql.init({
    ...config,
    t: 'standard-sql',
    async query<TRow>(sql: string, schema: s.Schema<TRow>) {
      const rows = await config.query(sql, schema)
      return rows.map((row) => {
        if (typeof row !== 'object') {
          return row
        }

        if (row === null) {
          return row
        }

        if (!s.isObj<TRow>(schema)) {
          return row
        }

        const mapped: Partial<TRow> = { ...row }

        for (const key in mapped) {
          const columnSchema = schema.properties[key]

          if (s.isBool(columnSchema)) {
            const value = mapped[key]
            if (value === 0) {
              // @ts-expect-error
              mapped[key] = false
            }
            if (value === 1) {
              // @ts-expect-error
              mapped[key] = true
            }
          }
        }
        return mapped
      })
    },
  })
  return {
    ...base,
    aggregate: {
      StringConcat: (column, separator) => `STRING_AGG(${column}, '${separator}')`,
    },
    __migratable: Symbol('migratable'),
  }
}

export const ImplStandardSqlite = {
  init,
}

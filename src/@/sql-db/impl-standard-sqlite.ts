import type { s } from '~/@/schema'
import { TimeSpan } from '~/@/time/time-span'
import { ILogger } from '../logger'
import { ImplStandardSql } from './impl-standard-sql'
import type { ISqlDb } from './interface'

export type ImplStandardSqlite = {
  t: 'standard-sqlite'
  query: (rawSql: string, schema: s.Schema<unknown>) => Promise<unknown[]>
  logger: ILogger
  pollInterval?: TimeSpan
  garbageCollectionInterval?: TimeSpan
}

const init = (config: ImplStandardSqlite): ISqlDb => {
  const base = ImplStandardSql.init({
    t: 'standard-sql',
    async query(sql, schema) {
      const rows = await config.query(sql, schema)
      return rows.map((row) => {
        if (typeof row !== 'object') return row
        if (row === null) return row

        const mapped: Record<string, unknown> = { ...row }
        for (const key in mapped) {
          const columnSchema = schema.type === 'object' && schema.properties[key] ? schema.properties[key] : undefined
          if (columnSchema?.type === 'boolean') {
            const value = mapped[key]
            if (value === 0) {
              mapped[key] = false
            }
            if (value === 1) {
              mapped[key] = true
            }
          }
        }
        return mapped
      })
    },
    logger: config.logger,
    pollInterval: config.pollInterval,
    garbageCollectionInterval: config.garbageCollectionInterval,
  })
  return {
    ...base,
    aggregate: {
      StringConcat: (column, separator) => `STRING_AGG(${column}, '${separator}')`,
    },
  }
}

export const ImplStandardSqlite = {
  init,
}

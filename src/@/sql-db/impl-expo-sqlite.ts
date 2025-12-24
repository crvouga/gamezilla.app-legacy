import * as SQLite from 'expo-sqlite'
import { s } from '~/@/schema'
import { ILogger } from '../logger'
import { TimeSpan } from '../time/time-span'
import { ImplStandardSqlite } from './impl-standard-sqlite'
import type { IMigratableSqlDb } from './interface'

export type ImplExpoSqlite = {
  t: 'expo-sqlite'
  dbName: string
  logger: ILogger
  pollInterval?: TimeSpan
}

const init = (config: ImplExpoSqlite): IMigratableSqlDb => {
  const db = SQLite.openDatabaseAsync(config.dbName)

  const initDb = async () => {
    const dbInstance = await db
    try {
      await dbInstance.execAsync('PRAGMA journal_mode = WAL')
      await dbInstance.execAsync('PRAGMA synchronous = NORMAL')
      await dbInstance.execAsync('PRAGMA cache_size = 1000')
      await dbInstance.execAsync('PRAGMA foreign_keys = true')
      await dbInstance.execAsync('PRAGMA temp_store = memory')
      await dbInstance.execAsync('PRAGMA busy_timeout = 5000') // Add timeout for locks
      await dbInstance.execAsync('PRAGMA locking_mode = NORMAL') // Use less aggressive locking
    } catch (err) {
      config.logger.error('Failed to initialize SQLite database:', err)
      throw err
    }
  }
  initDb()

  return ImplStandardSqlite.init({
    ...config,
    t: 'standard-sqlite',
    async query<TRow>(sql: string, _schema: s.Schema<TRow>): Promise<unknown[]> {
      const dbInstance = await db
      const trimmedSql = sql.trim().toLowerCase()
      const isSelect = trimmedSql.startsWith('select') || trimmedSql.startsWith('with')

      try {
        if (isSelect) {
          const result = await dbInstance.getAllAsync(sql)
          return result || []
        } else {
          // Add retry logic for write operations to handle table locks
          let retries = 3
          let lastError: unknown
          while (retries > 0) {
            try {
              await dbInstance.execAsync(sql)
              return []
            } catch (err) {
              lastError = err
              const isLocked = err instanceof Error && err.message.includes('database table is locked')
              if (!isLocked) {
                throw err
              }
              retries--
              if (retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, 100)) // Wait 100ms before retry
              }
            }
          }
          config.logger.error('SQLite query failed after retries:', lastError, sql)
          throw lastError
        }
      } catch (err) {
        config.logger.error('SQLite query error:', err, sql)
        throw err
      }
    },
  })
}

export const ImplExpoSqlite = {
  init,
}

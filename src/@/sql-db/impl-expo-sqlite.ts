import * as SQLite from 'expo-sqlite'
import { ILogger } from '../logger'
import { ImplStandardSql } from './impl-standard-sql'
import type { ISqlDb } from './interface'
import { TimeSpan } from '../time/time-span'

export type SqlDbImplExpoSqlite = {
  t: 'expo-sqlite'
  dbName: string
  logger: ILogger
  pollInterval?: TimeSpan
}

const init = (config: SqlDbImplExpoSqlite): ISqlDb => {
  const db = SQLite.openDatabaseAsync(config.dbName)

  const query = async (rawSql: string): Promise<unknown[]> => {
    const dbInstance = await db
    const trimmedSql = rawSql.trim().toLowerCase()
    const isSelect = trimmedSql.startsWith('select') || trimmedSql.startsWith('with')

    try {
      if (isSelect) {
        const result = await dbInstance.getAllAsync(rawSql)
        return result || []
      } else {
        // Add retry logic for write operations to handle table locks
        let retries = 3
        let lastError: unknown
        while (retries > 0) {
          try {
            await dbInstance.execAsync(rawSql)
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
        config.logger.error('SQLite query failed after retries:', lastError, rawSql)
        throw lastError
      }
    } catch (err) {
      config.logger.error('SQLite query error:', err, rawSql)
      throw err
    }
  }

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

  return ImplStandardSql.init({
    t: 'standard-sql',
    query,
    logger: config.logger,
    pollInterval: config.pollInterval,
  })
}

export const SqlDbImplExpoSqlite = {
  init,
}

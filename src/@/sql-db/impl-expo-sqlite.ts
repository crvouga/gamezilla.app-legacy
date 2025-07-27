import * as SQLite from 'expo-sqlite'
import { ILogger } from '../logger'
import { ImplStandardSql } from './impl-standard-sql'
import type { ISqlDb } from './interface'

export type ImplExpoSqlite = {
  t: 'expo-sqlite'
  dbName: string
  logger: ILogger
}

const init = (config: ImplExpoSqlite): ISqlDb => {
  const db = SQLite.openDatabaseAsync(config.dbName)

  const query = async (rawSql: string): Promise<unknown[]> => {
    const dbInstance = await db
    const trimmedSql = rawSql.trim().toLowerCase()
    const isSelect = trimmedSql.startsWith('select') || trimmedSql.startsWith('with')

    // Wrap query execution in try/catch to handle errors
    try {
      if (isSelect) {
        const result = await dbInstance.getAllAsync(rawSql)
        return result || []
      } else {
        await dbInstance.execAsync(rawSql)
        return []
      }
    } catch (err) {
      config.logger.error('SQLite query error:', err, rawSql)
      throw err
    }
  }

  const initDb = async () => {
    const dbInstance = await db
    try {
      await dbInstance.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA cache_size = 1000;
        PRAGMA foreign_keys = true;
        PRAGMA temp_store = memory;
      `)
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
  })
}

export const ImplExpoSqlite = {
  init,
}

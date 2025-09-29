import DatabaseNamespace from 'better-sqlite3'
import type { IFileSystem } from '../file-system/interface'
import type { ILogger } from '../logger/interface'
import { TimeSpan } from '../time/time-span'
import { ImplStandardSqlite } from './impl-standard-sqlite'
import type { ISqlDb } from './interface'
const Database = (DatabaseNamespace as any).default || DatabaseNamespace

export type ImplBetterSqlite3 = {
  t: 'better-sqlite3'
  databasePath: string
  logger: ILogger
  fs: IFileSystem
  options?: {
    readonly?: boolean
    fileMustExist?: boolean
    timeout?: number
    verbose?: (message?: any, ...additionalArgs: any[]) => void
  }
  pollInterval?: TimeSpan
}

const init = (config: ImplBetterSqlite3): ISqlDb => {
  if (config.databasePath !== ':memory:') {
    const dir = config.databasePath.substring(0, config.databasePath.lastIndexOf('/'))
    const setup = async () => {
      const dirExists = await config.fs.exists(dir)
      if (!dirExists) {
        const tempPath = `${dir}/.temp`
        await config.fs.write(tempPath, '')
        await config.fs.delete(tempPath)
      }
    }
    setup()
  }

  const db = new Database(config.databasePath, config.options)

  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA synchronous = NORMAL;')
  db.exec('PRAGMA cache_size = 1000;')
  db.exec('PRAGMA foreign_keys = true;')
  db.exec('PRAGMA temp_store = memory;')

  const query = async (rawSql: string): Promise<unknown[]> => {
    const trimmedSql = rawSql.trim().toLowerCase()
    const isSelect = trimmedSql.startsWith('select') || trimmedSql.startsWith('with')

    if (isSelect) {
      const stmt = db.prepare(rawSql)
      return stmt.all()
    } else {
      const stmt = db.prepare(rawSql)
      stmt.run()
      return []
    }
  }

  return ImplStandardSqlite.init({
    t: 'standard-sqlite',
    query,
    logger: config.logger,
    pollInterval: config.pollInterval,
  })
}

export const ImplBetterSqlite3 = {
  init,
}

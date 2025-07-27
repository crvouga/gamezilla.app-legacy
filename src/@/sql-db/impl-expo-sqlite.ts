import * as SQLite from 'expo-sqlite'
import { Ok } from '~/@/result'
import { ILogger } from '../logger'
import { Sub } from '../sub'
import type { ISqlDb } from './interface'

export type ImplExpoSqlite = {
  t: 'expo-sqlite'
  dbName: string
  logger: ILogger
}

const init = (config: ImplExpoSqlite): ISqlDb => {
  const dbPromise = SQLite.openDatabaseAsync(config.dbName)
  return {
    aggregate: {
      StringConcat: (column, separator) => `GROUP_CONCAT(${column}, ${separator})`,
    },
    sub() {
      return Sub.none()
    },
    async query() {
      await dbPromise
      return Ok([])
    },
    async notify() {
      return Ok(null)
    },
    async listen() {
      return async () => {}
    },
  }
}

export const ImplExpoSqlite = {
  init,
}

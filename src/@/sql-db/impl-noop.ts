import { Ok } from '~/@/result'
import { Sub } from '../sub'
import type { ISqlDb } from './interface'

export type Config = {
  t: 'noop'
}

export const SqlDb = (_config: Config): ISqlDb => {
  return {
    aggregate: {
      StringConcat: (column, separator) => `GROUP_CONCAT(${column}, '${separator}')`,
    },
    sub() {
      return Sub.none()
    },
    async query() {
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

export const SQL_DB_NOOP = SqlDb({ t: 'noop' })

import { Ok } from '~/@/result'
import type { ISqlDb } from './interface'
import { Sub } from '../sub'

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

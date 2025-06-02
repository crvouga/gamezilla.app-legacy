import { Ok } from '~/@/result'
import type { SqlDb } from '../interface'
import { Sub } from '../../sub'

export type Config = {
  t: 'noop'
}

export const DbConnSql = (_config: Config): SqlDb => {
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

import { Ok } from '~/@/result'
import type { IDbConnSql } from './interface'

export type Config = {
  t: 'noop'
}

export const DbConnSql = (_config: Config): IDbConnSql => {
  return {
    async subscribe() {
      return {
        initialRows: [],
        unsubscribe: async () => {},
        refresh: async () => {},
      }
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

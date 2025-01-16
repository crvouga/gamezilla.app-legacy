import { IDbConnSql } from '~/@/db-conn-sql'
import { Err } from '~/@/result'
import { Sub } from '~/@/sub'

export type Config = {
  t: 'powersync'
}

export const DbConnSql = (_config: Config): IDbConnSql => {
  return {
    async listen() {
      return async () => {}
    },
    async notify() {
      return Err('Not implemented')
    },
    async query() {
      return Err('Not implemented')
    },
    async subscribe() {
      return {
        initialRows: [],
        refresh: async () => {},
        unsubscribe: async () => {},
      }
    },
    sub() {
      return Sub.None
    },
  }
}

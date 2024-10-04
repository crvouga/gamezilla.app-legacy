import { Ok } from 'gamezilla-app/@/core'
import type { IDbConnSql } from './interface'

export type Config = {
  t: 'noop'
}

export const DbConnSql = (_config: Config): IDbConnSql => {
  return {
    async query() {
      return Ok([])
    },
    async notify(_channel, _payload) {
      return Ok(null)
    },
    async listen() {
      return () => {}
    }
  }
}

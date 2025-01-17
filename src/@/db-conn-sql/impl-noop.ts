import { Ok } from '~/@/result'
import type { IDbConnSql } from './interface'
import { Sub } from '../sub'

export type Config = {
  t: 'noop'
}

export const DbConnSql = (_config: Config): IDbConnSql => {
  return {
    sub() {
      return Sub.None
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

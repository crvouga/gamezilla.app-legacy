import { Ok } from '~/@/result'
import { ILogger } from '../logger'
import { Sub } from '../sub'
import type { ISqlDb } from './interface'

export type ImplNoop = {
  t: 'noop'
  logger: ILogger
}

const init = (_config: ImplNoop): ISqlDb => {
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

export const ImplNoop = {
  init,
}

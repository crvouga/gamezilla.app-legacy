import { IDbConnKv } from '~/@/db-conn-kv'
import { Err } from '~/@/result'
import { ISolutionsDb } from './interface'

export type Config = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
}

export const SolutionsDb = (_config: Config): ISolutionsDb => {
  return {
    async find(_hash) {
      return Err('not implemented')
    },
    async put(_solutions) {
      return Err('not implemented')
    },
  }
}

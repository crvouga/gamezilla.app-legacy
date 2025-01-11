import { DbConnKv, IDbConnKv } from '~/@/db-conn-kv'
import { Err } from '~/@/result'
import { Solutions } from '../solutions'
import { ISolutionsDb } from './interface'

export type Config = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
}

export const SolutionsDb = (config: Config): ISolutionsDb => {
  const solutionsByHash = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['flow', 'solutions-by-hash'],
    parser: Solutions,
  })
  return {
    async get(hash) {
      return await solutionsByHash.get(hash)
    },
    async put(_solutions) {
      return Err('not implement')
      // return solutionsByHash.setMany(Object.entries(solutions).map(([hash, solution]) => [hash, solution]))
    },
  }
}

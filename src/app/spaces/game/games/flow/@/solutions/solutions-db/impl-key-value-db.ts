import { IKeyValueDb, KeyValueDb } from '~/@/key-value-db'
import { s } from '~/@/schema'
import { isErr, Ok } from '~/@/result'
import { Sub } from '~/@/sub'
import { Solution } from '../solution'
import { ISolutionsDb } from './interface'
import { Solutions } from '../solutions'

export type Config = {
  t: 'key-value-db'
  keyValueDb: IKeyValueDb
}

export const SolutionsDb = (config: Config): ISolutionsDb => {
  const solutionsByHash = KeyValueDb.withNamespace({
    keyValueDb: config.keyValueDb,
    namespace: ['game', 'flow', 'solutions-by-hash'],
    schema: s.arr(Solution),
  })
  return {
    async get(hash) {
      const got = await solutionsByHash.get(hash)

      if (isErr(got)) return got

      if (!got.value) return Ok([])

      return Ok(got.value)
    },
    async put(solutions) {
      for (const [hash, sols] of Solutions.groupByHash(solutions)) {
        const put = await solutionsByHash.set(hash, sols)
        if (isErr(put)) return put
      }
      return Ok(null)
    },
    async zap(hash) {
      const zap = await solutionsByHash.zap(hash)

      if (isErr(zap)) return zap

      return Ok(null)
    },
    sub(_hash) {
      return Sub.none()
    },
  }
}

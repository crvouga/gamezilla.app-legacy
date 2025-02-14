import { KeyValueDb, IKeyValueDb } from '~/@/key-value-db'
import { p } from '~/@/parser'
import { isErr, Ok } from '~/@/result'
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
    parser: p.arr(Solution),
  })
  return {
    async get(hash) {
      const got = await solutionsByHash.get(hash)

      if (isErr(got)) return got

      if (!got.value) return Ok({})

      return Ok({ [hash]: got.value ?? [] })
    },
    async put(solutions) {
      for (const [hash, sols] of Solutions.iter(solutions)) {
        const put = await solutionsByHash.set(hash, sols)
        if (isErr(put)) return put
      }
      return Ok(null)
    },
  }
}

import { describe, expect, test } from 'bun:test'
import { Logger } from '~/@/logger'
import { Ok } from '~/@/result'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SolutionHash } from '../solution-hash/solution-hash'
import { VariantGridShorthand } from '../../variant/grid'
import { Solutions } from '../solutions'
import { Config, SolutionsDb } from './impl'

const Fixture = async (config: Config) => {
  const solutionsDb = SolutionsDb(config)

  return {
    solutionsDb,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()

  const configs: Config[] = []

  configs.push({
    t: 'key-value-db',
    keyValueDb: f.keyValueDbHashMap,
  })

  configs.push({
    t: 'sql-db',
    sqlDb: f.sqlDbSqlite,
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql-db',
      sqlDb: f.sqlDbPostgres,
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('Test', () => {
  test('get and put', async () => {
    for (const f of await Fixtures()) {
      const numberlink = VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ])
      const hash = SolutionHash.init(numberlink)
      const zapped = await f.solutionsDb.zap(hash)

      const solutions = await Solutions.find({ models: [numberlink], logger: Logger({ t: 'noop' }) })

      const before = await f.solutionsDb.get(hash)
      const put = await f.solutionsDb.put(solutions)
      const after = await f.solutionsDb.get(hash)

      expect(zapped).toEqual(Ok(null))
      expect(before).toEqual(Ok([]))
      expect(put).toEqual(Ok(null))
      expect(after).toEqual(Ok(solutions))
    }
  })

  test('zap', async () => {
    for (const f of await Fixtures()) {
      const numberlink = VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ])
      const hash = SolutionHash.init(numberlink)
      const solutions = await Solutions.find({ models: [numberlink], logger: Logger({ t: 'noop' }) })
      await f.solutionsDb.put(solutions)

      const before = await f.solutionsDb.get(hash)
      const zap = await f.solutionsDb.zap(hash)
      const after = await f.solutionsDb.get(hash)

      expect(before).toEqual(Ok(solutions))
      expect(zap).toEqual(Ok(null))
      expect(after).toEqual(Ok([]))
    }
  })
})

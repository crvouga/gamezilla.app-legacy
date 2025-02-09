import { describe, expect, it } from 'bun:test'
import { Ok } from '~/@/result'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { FlowHash } from '../../flow/hash'
import { VariantGridShorthand } from '../../variant/grid'
import { Solutions } from '../solutions'
import { Config, SolutionsDb } from './impl'

const Fixture = async (config: Config) => {
  const solutionsDb = await SolutionsDb(config)

  return {
    solutionsDb,
  }
}

const Fixtures = async () => {
  const env = await FixtureAppBackend()
  const f = await FixtureAppBackend()

  const configs: Config[] = []

  configs.push({
    t: 'key-value-db',
    keyValueDb: f.ctx.keyValueDb,
  })

  if (env.t === 'integration') {
    configs.push({
      t: 'db-conn-sql',
      dbConnSql: f.ctx.dbConnSql,
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe.skip(import.meta.file, () => {
  it('get and put', async () => {
    for (const f of await Fixtures()) {
      const flow = VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ])
      const hash = FlowHash.init(flow)
      const solutions = await Solutions.find([flow])

      const before = await f.solutionsDb.get(hash)
      const put = await f.solutionsDb.put(solutions)
      const after = await f.solutionsDb.get(hash)

      expect(before).toEqual(Ok(Solutions.init))
      expect(put).toEqual(Ok(null))
      expect(after).toEqual(Ok(solutions))
    }
  })
})

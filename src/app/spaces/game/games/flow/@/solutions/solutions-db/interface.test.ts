import { describe, expect, it } from 'bun:test'
import { Ok } from '~/@/result'
import { FixtureAppServer } from '~/app/@/server/fixture'
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
  const f = await FixtureAppServer()

  const configs: Config[] = [
    {
      t: 'db-conn-kv',
      dbConnKv: f.ctx.dbConnKv,
    },
  ]

  return Promise.all(configs.map(Fixture))
}

describe.only(import.meta.file, () => {
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

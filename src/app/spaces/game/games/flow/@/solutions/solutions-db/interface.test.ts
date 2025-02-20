import { describe, expect, test } from 'bun:test'
import { loggerNoop } from '~/@/logger/impl-noop'
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
  const f = await FixtureAppBackend()

  const configs: Config[] = []

  configs.push({
    t: 'key-value-db',
    keyValueDb: f.keyValueDbHashMap,
  })

  configs.push({
    t: 'with-sql-tables',
    dbConnSql: f.dbConnSqlite,
    solutionsDb: SolutionsDb({
      t: 'db-conn-sql',
      dbConnSql: f.dbConnSqlite,
    }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'db-conn-sql',
      dbConnSql: f.dbConnPostgres,
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe(import.meta.file, () => {
  test('get and put', async () => {
    for (const f of await Fixtures()) {
      const flow = VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ])
      const hash = FlowHash.init(flow)
      const zapped = await f.solutionsDb.zap(hash)

      const solutions = await Solutions.find({ models: [flow], logger: loggerNoop })

      const before = await f.solutionsDb.get(hash)
      const put = await f.solutionsDb.put(solutions)
      const after = await f.solutionsDb.get(hash)

      expect(zapped).toEqual(Ok(null))
      expect(before).toEqual(Ok({}))
      expect(put).toEqual(Ok(null))
      expect(after).toEqual(Ok(solutions))
    }
  })

  test('zap', async () => {
    for (const f of await Fixtures()) {
      const flow = VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ])
      const hash = FlowHash.init(flow)
      const solutions = await Solutions.find({ models: [flow], logger: loggerNoop })
      await f.solutionsDb.put(solutions)

      const before = await f.solutionsDb.get(hash)
      const zap = await f.solutionsDb.zap(hash)
      const after = await f.solutionsDb.get(hash)

      expect(before).toEqual(Ok(solutions))
      expect(zap).toEqual(Ok(null))
      expect(after).toEqual(Ok({}))
    }
  })
})

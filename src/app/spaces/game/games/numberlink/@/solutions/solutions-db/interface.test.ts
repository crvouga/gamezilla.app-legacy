import { Logger } from '~/@/logger'
import { Ok } from '~/@/result'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { describe, expect, test } from '~/@/test-runner'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { VariantGridShorthand } from '../../variant/grid/grid-shorthand'
import { SolutionHash } from '../solution-hash/solution-hash'
import { Solutions } from '../solutions'
import { SolutionsDb } from './impl'

const Fixture = async (config: SolutionsDb) => {
  const solutionsDb = SolutionsDb.init(config)

  return {
    solutionsDb,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()

  const configs: SolutionsDb[] = []

  configs.push({
    t: 'key-value-db',
    keyValueDb: f.keyValueDbHashMap,
  })

  configs.push({
    t: 'sql-db',
    sqlDb: f.sqlDbSqlite,
    logger: f.logger,
    migrationPolicy: SqlDbMigrationPolicy.init({ t: 'always-run', logger: Logger.init({ t: 'noop' }) }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql-db',
      sqlDb: f.sqlDbPostgres,
      logger: f.logger,
      migrationPolicy: SqlDbMigrationPolicy.init({ t: 'always-run', logger: Logger.init({ t: 'noop' }) }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('SolutionsDb', () => {
  test('get and put', async () => {
    for (const f of await Fixtures()) {
      const numberlink = VariantGridShorthand.toGrid([
        ['A', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', 'A'],
      ])
      const hash = SolutionHash.init(numberlink)
      const zapped = await f.solutionsDb.zap(hash)

      const solutions = await Solutions.find({ models: [numberlink], logger: Logger.init({ t: 'noop' }) })

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
      const solutions = await Solutions.find({ models: [numberlink], logger: Logger.init({ t: 'noop' }) })
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

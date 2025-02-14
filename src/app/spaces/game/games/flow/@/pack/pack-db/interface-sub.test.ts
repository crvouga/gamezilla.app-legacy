import { describe, expect, it } from 'bun:test'
import { Logger } from '~/@/logger'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { Pack } from '../pack'
import { Config, PackDb } from './impl'

const Fixture = (config: Config) => {
  const packDb = PackDb(config)
  return {
    packDb,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()
  const configs: Config[] = []

  configs.push({ t: 'hash-map' })

  const TEST_POWERSYNC = false
  if (f.t === 'integration' && TEST_POWERSYNC) {
    configs.push({ t: 'db-conn-sql', dbConnSql: f.dbConnPowersyncClient, logger: Logger({ t: 'console' }) })
  }

  return Promise.all(configs.map(Fixture))
}

describe(`PackDb.sub`, () => {
  it('should be able to subscribe to packs', async () => {
    for (const f of await Fixtures()) {
      const pack = await Pack.random()
      let results: Pack[] = []
      f.packDb
        .sub({
          where: { createdBy: { equals: pack.createdBy } },
          order: { createdAt: 'asc' },
          pagination: { limit: 10, offset: 0 },
        })
        .sub((packs) => {
          results = packs
        })
      await f.packDb.put(pack)
      expect(results).toEqual([pack])
    }
  })
})

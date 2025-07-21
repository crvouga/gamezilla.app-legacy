import { describe, expect, test } from '~/@/test-runner'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { Pack } from '../pack'
import { PackDb } from './impl'

const Fixture = (config: PackDb) => {
  const packDb = PackDb.init(config)
  return {
    packDb,
  }
}

const Fixtures = async () => {
  await FixtureAppBackend()
  const configs: PackDb[] = []

  configs.push({ t: 'hash-map' })

  return Promise.all(configs.map(Fixture))
}

describe(`PackDb.sub`, () => {
  test('should be able to subscribe to packs', async () => {
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

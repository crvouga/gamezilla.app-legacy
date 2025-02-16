import { describe, expect, it } from 'bun:test'
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
  await FixtureAppBackend()
  const configs: Config[] = []

  configs.push({ t: 'hash-map' })

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

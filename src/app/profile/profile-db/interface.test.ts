import { describe, expect, it } from 'bun:test'
import { Logger } from '~/@/logger'
import { Ok } from '~/@/result'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { ProfileCore } from '../@/profile-core'
import { Config, ProfileDb } from './impl'
import { Username } from '~/app/@/data/username'

const Fixture = (config: Config) => {
  const profileDb = ProfileDb(config)
  return {
    profileDb,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()
  const configs: Config[] = []

  configs.push({
    t: 'hash-map',
    logger: Logger({ t: 'noop' }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'db-conn-sql',
      dbConnSql: f.dbConnPostgres,
      logger: Logger({ t: 'console' }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('ProfileDb', () => {
  it('should work', async () => {
    for (const f of await Fixtures()) {
      const profile = await ProfileCore.random()
      const before = await f.profileDb.findByUserId(profile.userId)
      const put = await f.profileDb.put(profile)
      const after = await f.profileDb.findByUserId(profile.userId)
      expect(before).toEqual(Ok([]))
      expect(put).toEqual(Ok(null))
      expect(after).toEqual(Ok([profile]))
    }
  })

  it('should upsert a profile', async () => {
    for (const f of await Fixtures()) {
      const profile = await ProfileCore.random()
      const upsertResult = await f.profileDb.put(profile)
      expect(upsertResult).toEqual(Ok(null))

      const fetchedProfileAfterInsert = await f.profileDb.findByUserId(profile.userId)
      expect(fetchedProfileAfterInsert).toEqual(Ok([profile]))

      const updatedProfile = { ...profile, username: await Username.generate() }
      const upsertResultUpdate = await f.profileDb.put(updatedProfile)
      expect(upsertResultUpdate).toEqual(Ok(null))

      const fetchedProfileAfterUpdate = await f.profileDb.findByUserId(updatedProfile.userId)
      expect(fetchedProfileAfterUpdate).toEqual(Ok([updatedProfile]))
    }
  })
})

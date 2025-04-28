import { describe, expect, it, test } from 'bun:test'
import { Logger } from '~/@/logger'
import { Ok, unwrap } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { Profile } from '~/app/@/data/profile'
import { UserId } from '~/app/@/data/user-id'
import { Username } from '~/app/@/data/username'
import { Config, ProfileDb } from './impl'
import { ProfileDbQuery } from './query'

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

  configs.push({
    t: 'with-sql-tables',
    dbConnSql: f.dbConnSqlite,
    profileDb: ProfileDb({ t: 'sql', dbConnSql: f.dbConnSqlite, logger: Logger({ t: 'console' }) }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql',
      // dbConnSql: f.dbConnPostgres,
      dbConnSql: f.dbConnPostgres,
      logger: Logger({ t: 'console' }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('ProfileDb', () => {
  it('should work', async () => {
    for (const f of await Fixtures()) {
      const profile = await Profile.random()
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
      const profile = await Profile.random()
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

  test.only('query by user id', async () => {
    for (const f of await Fixtures()) {
      const userId = UserId.generate()

      const query: ProfileDbQuery = {
        whereAnd: {
          userId: { equals: userId },
        },
        order: {
          createdAt: 'asc',
        },
        pagination: {
          limit: 100,
          offset: 0,
        },
      }

      const before = await f.profileDb.query(query)

      const expected: Profile[] = []
      for (let i = 0; i < 10; i++) {
        const profile = await Profile.random({
          userId,
          createdAt: Posix.future(Posix.now(), TimeSpan.seconds(i)),
        })
        unwrap(await f.profileDb.put(profile))
        expected.push(profile)
      }

      for (let i = 0; i < 10; i++) {
        unwrap(await f.profileDb.put(await Profile.random()))
      }

      const after = await f.profileDb.query(query)

      expect(before).toEqual(
        Ok({
          items: [],
          limit: 100,
          offset: 0,
          total: 0,
        }),
      )
      expect(after).toEqual(
        Ok({
          items: expected,
          limit: 100,
          offset: 0,
          total: 10,
        }),
      )
    }
  })
})

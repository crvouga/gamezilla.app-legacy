import { describe, expect, test } from '~/@/test-runner'
import { Logger } from '~/@/logger'
import { Ok, unwrap } from '~/@/result'
import { UnixMs } from '~/@/time/unix-ms'
import { TimeSpan } from '~/@/time/time-span'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { Username } from '~/app/@/data/username'
import { Config, ProfileDb } from './impl'
import { ProfileDbQuery } from './interface-query'

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
    t: 'sql',
    sqlDb: f.sqlDbSqlite,
    logger: Logger({ t: 'console', namespace: ['profile-db'], newLinePerMsg: true }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql',
      // sqlDb: f.dbConnPostgres,
      sqlDb: f.sqlDbPostgres,
      logger: Logger({ t: 'console', namespace: ['profile-db'], newLinePerMsg: true }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('ProfileDb', () => {
  test('should work', async () => {
    for (const f of await Fixtures()) {
      const profile = await UserProfile.random()
      const before = await f.profileDb.findByUserIds([profile.userId])
      const put = await f.profileDb.put(profile)
      const after = await f.profileDb.findByUserIds([profile.userId])
      expect(before).toEqual(Ok([]))
      expect(put).toEqual(Ok(null))
      expect(after).toEqual(Ok([profile]))
    }
  })

  test('should upsert a profile', async () => {
    for (const f of await Fixtures()) {
      const profile = await UserProfile.random()
      const upsertResult = await f.profileDb.put(profile)
      expect(upsertResult).toEqual(Ok(null))

      const fetchedProfileAfterInsert = await f.profileDb.findByUserIds([profile.userId])
      expect(fetchedProfileAfterInsert).toEqual(Ok([profile]))

      const updatedProfile = { ...profile, username: await Username.generate() }
      const upsertResultUpdate = await f.profileDb.put(updatedProfile)
      expect(upsertResultUpdate).toEqual(Ok(null))

      const fetchedProfileAfterUpdate = await f.profileDb.findByUserIds([updatedProfile.userId])
      expect(fetchedProfileAfterUpdate).toEqual(Ok([updatedProfile]))
    }
  })

  test('query by user id', async () => {
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

      const expected = await UserProfile.random({
        userId: userId,
        createdAt: UnixMs.future(UnixMs.now(), TimeSpan.seconds(0)),
      })
      unwrap(await f.profileDb.put(expected))

      for (let i = 0; i < 10; i++) {
        unwrap(await f.profileDb.put(await UserProfile.random()))
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
          items: [expected],
          limit: 100,
          offset: 0,
          total: 1,
        }),
      )
    }
  })
})

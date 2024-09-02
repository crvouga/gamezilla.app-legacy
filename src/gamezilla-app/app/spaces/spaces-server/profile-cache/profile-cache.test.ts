import { describe, expect, test } from 'bun:test'
import { Result } from 'gamezilla-app/@/core'
import { Profile } from 'gamezilla-app/app/@/data'
import { AppServerTestEnv } from 'gamezilla-app/app/@/server/server-test-env'
import { ProfileCache } from './profile-cache-impl'

const Fixture = async () => {
  const testEnv = await AppServerTestEnv()
  const profileCache = ProfileCache({
    t: 'db-conn-kv',
    dbConnKv: testEnv.dbConnKv
  })
  return { profileCache }
}

describe(import.meta.file, () => {
  test('add and get', async () => {
    const f = await Fixture()
    const profiles = Profile.indexByUserId([await Profile.random(), await Profile.random(), await Profile.random()])
    const userIds = Object.values(profiles).map((p) => p.userId)

    const before = Result.unwrap(await f.profileCache.get(userIds))
    const added = Result.unwrap(await f.profileCache.add(profiles))
    const after = Result.unwrap(await f.profileCache.get(userIds))

    expect(before).toEqual({})
    expect(added).toEqual(null)
    expect(after).toEqual(profiles)
  })

  test('get missing', async () => {
    const f = await Fixture()
    const profiles = Profile.indexByUserId([await Profile.random(), await Profile.random(), await Profile.random()])
    const userIds = Object.values(profiles).map((p) => p.userId)

    const got = Result.unwrap(await f.profileCache.get(userIds))
    expect(got).toEqual({})

    const added = Result.unwrap(await f.profileCache.add(profiles))
    expect(added).toEqual(null)

    const gotAgain = Result.unwrap(await f.profileCache.get(userIds))
    expect(gotAgain).toEqual(profiles)
  })
})

import { describe, expect, test } from 'bun:test'
import { unwrapOr } from '~/@/result'
import { Profile } from '~/app/@/data/profile'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { ProfileCache } from './impl'

const Fixture = async () => {
  const f = await FixtureAppBackend()
  const profileCache = await ProfileCache({
    t: 'key-value-db',
    keyValueDb: f.keyValueDbHashMap,
  })
  return { profileCache }
}

describe(import.meta.file, () => {
  test('add and get', async () => {
    const f = await Fixture()
    const profiles = Profile.indexByUserId([await Profile.random(), await Profile.random(), await Profile.random()])
    const userIds = Object.values(profiles).map((p) => p.userId)

    const before = unwrapOr(await f.profileCache.get(userIds), null)
    const added = unwrapOr(await f.profileCache.add(profiles), null)
    const after = unwrapOr(await f.profileCache.get(userIds), null)

    expect(before).toEqual({})
    expect(added).toEqual(null)
    expect(after).toEqual(profiles)
  })

  test('get missing', async () => {
    const f = await Fixture()
    const profiles = Profile.indexByUserId([await Profile.random(), await Profile.random(), await Profile.random()])
    const userIds = Object.values(profiles).map((p) => p.userId)

    const got = unwrapOr(await f.profileCache.get(userIds), null)
    expect(got).toEqual({})

    const added = unwrapOr(await f.profileCache.add(profiles), null)
    expect(added).toEqual(null)

    const gotAgain = unwrapOr(await f.profileCache.get(userIds), null)
    expect(gotAgain).toEqual(profiles)
  })
})

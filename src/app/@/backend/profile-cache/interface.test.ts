import { describe, expect, test } from 'bun:test'
import { unwrapOr } from '~/@/result'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { UserProfile } from '~/app/@/data/user-profile'
import { ProfileCache } from './impl'

const Fixture = async () => {
  const f = await FixtureAppBackend()
  const profileCache = await ProfileCache({
    t: 'key-value-db',
    keyValueDb: f.keyValueDbHashMap,
  })
  return { profileCache }
}

describe('Test', () => {
  test('add and get', async () => {
    const f = await Fixture()
    const profiles = [await UserProfile.random(), await UserProfile.random(), await UserProfile.random()]
    const userIds = Object.values(profiles).map((p) => p.id)

    const before = unwrapOr(await f.profileCache.getByUserId(userIds), null)
    const added = unwrapOr(await f.profileCache.add(profiles), null)
    const after = unwrapOr(await f.profileCache.getByUserId(userIds), null)

    expect(before).toEqual([])
    expect(added).toEqual(null)
    expect(after).toEqual(profiles)
  })

  test('get missing', async () => {
    const f = await Fixture()
    const profiles = [await UserProfile.random(), await UserProfile.random(), await UserProfile.random()]
    const userIds = Object.values(profiles).map((p) => p.id)

    const got = unwrapOr(await f.profileCache.getByUserId(userIds), null)
    expect(got).toEqual([])

    const added = unwrapOr(await f.profileCache.add(profiles), null)
    expect(added).toEqual(null)

    const gotAgain = unwrapOr(await f.profileCache.getByUserId(userIds), null)
    expect(gotAgain).toEqual(profiles)
  })
})

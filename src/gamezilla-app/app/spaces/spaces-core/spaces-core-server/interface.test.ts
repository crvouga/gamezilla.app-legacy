import { describe, expect, it, test } from 'bun:test'
import { Ok, unwrap } from 'gamezilla-app/@/core'
import { SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { DbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import * as SpaceCore from '../space-core'
import { SpacesCoreServer } from './impl'

const Fixture = async () => {
  const spacesCoreServer = await SpacesCoreServer({
    t: 'db-conn-kv',
    dbConnKv: await DbConnKv({
      t: 'hash-map'
    })
  })

  const spaceId = SpaceId.generate()
  const spaceA = SpaceCore.random({ spaceId })

  return {
    spacesCoreServer,
    spaceId,
    spaceA
  }
}

describe(import.meta.file, () => {
  it('should work', async () => {
    const f = await Fixture()

    const spaceId = SpaceCore.toSpaceStarted(f.spaceA)?.spaceId ?? null

    const before = await f.spacesCoreServer.get(spaceId)

    const upserted = await f.spacesCoreServer.upsert(f.spaceA)

    const after = await f.spacesCoreServer.get(spaceId)

    expect(before).toEqual(Ok(null))
    expect(upserted).toEqual(Ok(null))
    expect(after).toEqual(Ok(f.spaceA))
  })

  it('should be able to list spaces', async () => {
    const f = await Fixture()

    const before = unwrap(
      await f.spacesCoreServer.list({
        limit: 10,
        offset: 0
      })
    )

    const upserted = await f.spacesCoreServer.upsert(f.spaceA)

    const after = unwrap(
      await f.spacesCoreServer.list({
        limit: 10,
        offset: 0
      })
    )

    expect(before.items).toEqual([])
    expect(upserted).toEqual(Ok(null))
    expect(after.items).toEqual([f.spaceA])
  })

  test('hasEvent', async () => {
    const f = await Fixture()

    const eventId = Object.values(f.spaceA.eventIds)[0]
    if (!eventId) throw new Error('eventId not found')

    const spaceId = SpaceCore.toSpaceStarted(f.spaceA)?.spaceId
    if (!spaceId) throw new Error('spaceId not found')

    const before = await f.spacesCoreServer.hasEvent(spaceId, eventId)

    const upserted = await f.spacesCoreServer.upsert(f.spaceA)

    const after = await f.spacesCoreServer.hasEvent(spaceId, eventId)

    expect(before).toEqual(false)
    expect(upserted).toEqual(Ok(null))
    expect(after).toEqual(true)
  })

  test('update', async () => {
    const spaceId = SpaceId.generate()
    const f = await Fixture()
    const before = unwrap(await f.spacesCoreServer.get(spaceId))
    await f.spacesCoreServer.update(
      withId({
        t: 'user-started-space',
        spaceId: spaceId,
        userId: UserId.generate()
      })
    )
    const after = unwrap(await f.spacesCoreServer.get(spaceId))
    expect(SpaceCore.toSpaceStarted(before)).toEqual(null)
    expect(SpaceCore.toSpaceStarted(after)?.type).toEqual('started')
  })

  test('getWithFallback', async () => {
    const f = await Fixture()
    const before = unwrap(await f.spacesCoreServer.get(f.spaceId)) ?? SpaceCore.init
    await f.spacesCoreServer.upsert(f.spaceA)
    const after = unwrap(await f.spacesCoreServer.get(f.spaceId)) ?? SpaceCore.init
    expect(SpaceCore.deriveState(before).type).toEqual('initial')
    expect(SpaceCore.deriveState(after).type).toEqual('started')
  })
})

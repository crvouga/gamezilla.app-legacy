import { describe, expect, it, test } from 'bun:test'
import { Ok, unwrap } from 'gamezilla-app/@/core'
import { SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { DbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { EventMeta, withEventId } from 'gamezilla-app/@/event-sourced/event'
import * as SpaceCore from '../space-core'
import { Config, SpacesCoreServer } from './impl'
import { Logger } from 'gamezilla-app/app/@/server/logger'
import { Stream } from 'gamezilla-app/app/@/server/stream/impl'
import { p } from 'gamezilla-app/@/core/parser'
import { EventSourced } from 'gamezilla-app/@/event-sourced'
import { MsgCore } from '../event'

const Fixture = async (config: Config) => {
  const spacesCoreServer = await SpacesCoreServer(config)
  const spaceId = SpaceId.generate()
  const spaceA = SpaceCore.random({ spaceId })
  return {
    spacesCoreServer,
    spaceId,
    spaceA
  }
}

const Fixtures = async () => {
  const configs: Config[] = [
    {
      t: 'db-conn-kv',
      dbConnKv: await DbConnKv({
        t: 'hash-map'
      }),
      logger: Logger({ t: 'noop' })
    }
  ]

  const TEST = false

  if (TEST) {
    configs.push({
      t: 'stream',
      dbConnKv: await DbConnKv({
        t: 'hash-map'
      }),
      logger: Logger({ t: 'noop' }),
      stream: await Stream({
        t: 'in-memory',
        parser: p.and(MsgCore, EventMeta)
      })
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe(import.meta.file, () => {
  it('should work', async () => {
    for (const f of await Fixtures()) {
      const spaceId = SpaceCore.toSpaceStarted(f.spaceA)?.spaceId ?? null

      const before = await f.spacesCoreServer.get(spaceId)

      const upserted = await f.spacesCoreServer.upsert(f.spaceA)

      const after = await f.spacesCoreServer.get(spaceId)

      expect(before).toEqual(Ok(null))
      expect(upserted).toEqual(Ok(null))
      expect(after).toEqual(Ok(f.spaceA))
    }
  })

  test('list spaces', async () => {
    for (const f of await Fixtures()) {
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
    }
  })

  test('hasEvent', async () => {
    for (const f of await Fixtures()) {
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
    }
  })

  test('update', async () => {
    const spaceId = SpaceId.generate()
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesCoreServer.get(spaceId))
      await f.spacesCoreServer.update(
        withEventId({
          t: 'user-started-space',
          spaceId: spaceId,
          userId: UserId.generate()
        })
      )
      const after = unwrap(await f.spacesCoreServer.get(spaceId))
      expect(SpaceCore.toSpaceStarted(before)).toEqual(null)
      expect(SpaceCore.toSpaceStarted(after)?.type).toEqual('started')
    }
  })

  test('get with fallback', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesCoreServer.get(f.spaceId)) ?? SpaceCore.init
      await f.spacesCoreServer.upsert(f.spaceA)
      const after = unwrap(await f.spacesCoreServer.get(f.spaceId)) ?? SpaceCore.init
      expect(EventSourced.deriveState(SpaceCore.config, before).type).toEqual('initial')
      expect(EventSourced.deriveState(SpaceCore.config, after).type).toEqual('started')
    }
  })

  test("multiple spaces don't collide", async () => {
    for (const f1 of await Fixtures()) {
      for (const f2 of await Fixtures()) {
        await f1.spacesCoreServer.upsert(f1.spaceA)
        await f2.spacesCoreServer.upsert(f2.spaceA)
        const after1 = unwrap(await f1.spacesCoreServer.get(f1.spaceId))
        const after2 = unwrap(await f2.spacesCoreServer.get(f2.spaceId))
        expect(after1).toMatchObject(f1.spaceA)
        expect(after2).toMatchObject(f2.spaceA)
      }
    }
  })
})

import { describe, expect, it, test } from 'bun:test'
import { Ok, unwrap } from '~/@/result'
import { p } from '~/@/parser'
import { EventSourced } from '~/@/event-sourced'
import { EventMeta, withEventId } from '~/@/event-sourced/event'
import { UserId } from '~/app/@/data/user-id'
import { SpaceId } from '~/app/@/data/space-id'
import { DbConnKv } from '~/@/db-conn-kv'
import { Logger } from '~/@/logger'
import { Stream } from '~/@/stream/impl'
import { Space } from '../space'
import { SpaceEvent } from '../space-event'
import { Config, SpaceBackend } from './impl'
import { Runtime } from '~/@/runtime'

const Fixture = async (config: Config) => {
  const spaceBackend = await SpaceBackend(config)
  const spaceId = SpaceId.generate()
  const spaceA = Space.random({ spaceId })
  return {
    spaceBackend,
    spaceId,
    spaceA,
  }
}

const Fixtures = async () => {
  const configs: Config[] = [
    {
      t: 'db-conn-kv',
      dbConnKv: await DbConnKv({
        t: 'hash-map',
      }),
      logger: Logger({ t: 'noop' }),
      runtime: Runtime({ t: 'noop' }),
    },
  ]

  const TEST = false

  if (TEST) {
    configs.push({
      t: 'stream',
      dbConnKv: await DbConnKv({
        t: 'hash-map',
      }),
      logger: Logger({ t: 'noop' }),
      stream: await Stream({
        t: 'in-memory',
        parser: p.and(SpaceEvent, EventMeta),
      }),
      runtime: Runtime({ t: 'noop' }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe(import.meta.file, () => {
  it('should work', async () => {
    for (const f of await Fixtures()) {
      const spaceId = Space.toSpaceStarted(f.spaceA)?.spaceId ?? null

      const before = await f.spaceBackend.get(spaceId)

      const upserted = await f.spaceBackend.upsert(f.spaceA)

      const after = await f.spaceBackend.get(spaceId)

      expect(before).toEqual(Ok(null))
      expect(upserted).toEqual(Ok(null))
      expect(after).toEqual(Ok(f.spaceA))
    }
  })

  test('list spaces', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(
        await f.spaceBackend.list({
          pagination: {
            limit: 10,
            offset: 0,
          },
        }),
      )

      const upserted = await f.spaceBackend.upsert(f.spaceA)

      const after = unwrap(
        await f.spaceBackend.list({
          pagination: {
            limit: 10,
            offset: 0,
          },
        }),
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

      const spaceId = Space.toSpaceStarted(f.spaceA)?.spaceId
      if (!spaceId) throw new Error('spaceId not found')

      const before = await f.spaceBackend.hasEvent(spaceId, eventId)

      const upserted = await f.spaceBackend.upsert(f.spaceA)

      const after = await f.spaceBackend.hasEvent(spaceId, eventId)

      expect(before).toEqual(false)
      expect(upserted).toEqual(Ok(null))
      expect(after).toEqual(true)
    }
  })

  test('update', async () => {
    const spaceId = SpaceId.generate()
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spaceBackend.get(spaceId))
      await f.spaceBackend.update(
        withEventId({
          t: 'user-started-space',
          spaceId: spaceId,
          userId: UserId.generate(),
        }),
      )
      const after = unwrap(await f.spaceBackend.get(spaceId))
      expect(Space.toSpaceStarted(before)).toEqual(null)
      expect(Space.toSpaceStarted(after)?.type).toEqual('started')
    }
  })

  test('get with fallback', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spaceBackend.get(f.spaceId)) ?? Space.init
      await f.spaceBackend.upsert(f.spaceA)
      const after = unwrap(await f.spaceBackend.get(f.spaceId)) ?? Space.init
      expect(EventSourced.toState(Space.config, before).type).toEqual('initial')
      expect(EventSourced.toState(Space.config, after).type).toEqual('started')
    }
  })

  test("multiple spaces don't collide", async () => {
    for (const f1 of await Fixtures()) {
      for (const f2 of await Fixtures()) {
        await f1.spaceBackend.upsert(f1.spaceA)
        await f2.spaceBackend.upsert(f2.spaceA)
        const after1 = unwrap(await f1.spaceBackend.get(f1.spaceId))
        const after2 = unwrap(await f2.spaceBackend.get(f2.spaceId))
        expect(after1).toMatchObject(f1.spaceA)
        expect(after2).toMatchObject(f2.spaceA)
      }
    }
  })
})

import { describe, expect, it, test } from 'bun:test'
import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { DbConnKv } from '~/@/db-conn-kv'
import { EventSourced } from '~/@/event-sourced'
import { EventMeta, withEventId } from '~/@/event-sourced/event'
import { Logger } from '~/@/logger'
import { p } from '~/@/parser'
import { isErr, Ok, unwrap } from '~/@/result'
import { Runtime } from '~/@/runtime'
import { Stream } from '~/@/stream/impl'
import { PubSub } from '~/@/sub'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../space'
import { SpaceEvent } from '../space-event'
import { SpaceState } from '../space-state'
import { Config, SpaceBackend } from './impl'
import { TimeSpan } from '~/@/time/time-span'

const Fixture = async (config: Config) => {
  const _dangerouslyOverrideModel = PubSub.create<Space.Model>()
  const spaceBackend = await SpaceBackend({
    ...config,
    _dangerouslyOverrideModel,
  })
  const spaceId = SpaceId.generate()
  const space = Space.random({ spaceId: spaceId })

  return {
    _dangerouslyOverrideModel,
    spaceBackend,
    spaceId,
    space,
  }
}

const Fixtures = async () => {
  // const f = await FixtureAppBackend()

  const configs: Config[] = []

  configs.push({
    t: 'db-conn-kv',
    dbConnKv: await DbConnKv({ t: 'hash-map' }),
    // dbConnKv: f.dbConnKv,
    logger: Logger({ t: 'noop' }),
    runtime: Runtime({ t: 'noop' }),
    writeThrottle: TimeSpan.milliseconds(0),
  })

  const TEST = false

  if (TEST) {
    configs.push({
      t: 'stream',
      dbConnKv: await DbConnKv({ t: 'hash-map' }),
      logger: Logger({ t: 'noop' }),
      stream: await Stream({ t: 'in-memory', parser: p.and(SpaceEvent, EventMeta) }),
      runtime: Runtime({ t: 'noop' }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe(import.meta.file, () => {
  it('should work', async () => {
    for (const f of await Fixtures()) {
      const spaceId = Space.toSpaceStarted(f.space)?.spaceId ?? null

      const before = await f.spaceBackend.get(spaceId)

      unwrap(await f.spaceBackend.upsert(f.space))

      const after = await f.spaceBackend.get(spaceId)

      expect(before).toEqual(Ok(null))
      expect(after).toEqual(Ok(f.space))
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

      unwrap(await f.spaceBackend.upsert(f.space))

      const after = unwrap(
        await f.spaceBackend.list({
          pagination: {
            limit: 10,
            offset: 0,
          },
        }),
      )

      expect(before.items).toEqual([])
      expect(after.items).toEqual([f.space])
    }
  })

  test('hasEvent', async () => {
    for (const f of await Fixtures()) {
      const eventId = Object.values(f.space.eventIds)[0]
      if (!eventId) throw new Error('eventId not found')

      const spaceId = Space.toSpaceStarted(f.space)?.spaceId
      if (!spaceId) throw new Error('spaceId not found')

      const before = await f.spaceBackend.hasEvent(spaceId, eventId)

      unwrap(await f.spaceBackend.upsert(f.space))

      const after = await f.spaceBackend.hasEvent(spaceId, eventId)

      expect(before).toEqual(false)
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
      unwrap(await f.spaceBackend.upsert(f.space))
      const after = unwrap(await f.spaceBackend.get(f.spaceId)) ?? Space.init
      expect(EventSourced.toState(Space.config, before).type).toEqual('initial')
      expect(EventSourced.toState(Space.config, after).type).toEqual('started')
    }
  })

  test("multiple spaces don't collide", async () => {
    for (const f1 of await Fixtures()) {
      for (const f2 of await Fixtures()) {
        unwrap(await f1.spaceBackend.upsert(f1.space))
        unwrap(await f2.spaceBackend.upsert(f2.space))
        const after1 = unwrap(await f1.spaceBackend.get(f1.spaceId))
        const after2 = unwrap(await f2.spaceBackend.get(f2.spaceId))
        expect(after1).toMatchObject(f1.space)
        expect(after2).toMatchObject(f2.space)
      }
    }
  })

  test.only('error when db has invalid data', async () => {
    for (const f of await Fixtures()) {
      unwrap(await f.spaceBackend.upsert(f.space))
      const before = await f.spaceBackend.get(f.spaceId)
      const invalid = toInvalidSpaceModel(f.space)
      await f._dangerouslyOverrideModel.pub(invalid)
      await new Promise((resolve) => setTimeout(resolve, 5))
      const after = await f.spaceBackend.get(f.spaceId)
      expect(before).toEqual(Ok(f.space))
      expect(after).not.toEqual(Ok(f.space))
      expect(isErr(after)).toEqual(true)
      expect(before).toEqual(Ok(f.space))
    }
  })
})

const toInvalidSpaceModel = (space: Space.Model) => {
  const latestEventId = space.snapshots._orderNewestFirst[0]

  if (!latestEventId) throw new Error('latestEventId not found')

  const latestSnapshot = space.snapshots._valuesByKey[latestEventId]

  if (!latestSnapshot) throw new Error('atestSnapshot not found')

  const corruptedSnapshot: Partial<SpaceState.Started> = {
    game: undefined,
    hostId: undefined,
    latestEventId: undefined,
    spaceId: 'spaceId' in latestSnapshot ? latestSnapshot.spaceId : undefined,
    type: 'started',
    users: {},
    visibility: undefined,
  }

  const corrupted: Space.Model = {
    ...space,
    snapshots: CappedOrderedDict.add(
      space.snapshots,
      latestEventId,
      // @ts-expect-error We are intentionally corrupting the snapshot
      corruptedSnapshot,
    ),
  }

  return corrupted
}

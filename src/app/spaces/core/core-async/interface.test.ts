import { describe, expect, it, test } from 'bun:test'
import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { EventSourced } from '~/@/event-sourced'
import { EventMeta, withEventId } from '~/@/event-sourced/event'
import { s } from '~/@/schema'
import { sleep } from '~/@/promise/sleep'
import { Ok, unwrap } from '~/@/result'
import { Stream } from '~/@/stream/impl'
import { PubSub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../space'
import { MsgSpace } from '../space-msg/space-msg'
import { SpaceState } from '../space-state'
import { Config, SpacesCoreAsync } from './impl'

const Fixture = async (config: Config) => {
  const _dangerouslyOverrideModel = PubSub.create<Space.Model>()
  const spacesCore = await SpacesCoreAsync({
    ...config,
    _dangerouslyOverrideModel,
  })
  const spaceId = SpaceId.generate()
  const space = Space.random({ spaceId: spaceId })

  return {
    _dangerouslyOverrideModel,
    spacesCore,
    spaceId,
    space,
  }
}
const uniqueNamespace = () => [`test-${Math.random().toString(36).substring(2, 15)}`]

const Fixtures = async () => {
  const f = await FixtureAppBackend()

  const configs: Config[] = []

  configs.push({
    t: 'key-value-db',
    keyValueDb: f.keyValueDbHashMap,
    logger: f.logger,
    runtime: f.runtime,
    writeThrottle: TimeSpan.milliseconds(0),
    namespace: uniqueNamespace(),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'key-value-db',
      runtime: f.runtime,
      keyValueDb: f.keyValueDbRedis,
      logger: f.logger,
      writeThrottle: TimeSpan.milliseconds(0),
      namespace: uniqueNamespace(),
    })

    configs.push({
      t: 'key-value-db',
      runtime: f.runtime,
      keyValueDb: f.keyValueDbPostgres,
      logger: f.logger,
      writeThrottle: TimeSpan.milliseconds(0),
      namespace: uniqueNamespace(),
    })
  }

  const TEST = false

  if (TEST) {
    configs.push({
      t: 'stream',
      keyValueDb: f.keyValueDbHashMap,
      logger: f.logger,
      stream: await Stream({ t: 'in-memory', schema: s.and(MsgSpace, EventMeta) }),
      runtime: f.runtime,
      namespace: uniqueNamespace(),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('Spaces Core Async', () => {
  it('should work', async () => {
    for (const f of await Fixtures()) {
      const spaceId = Space.toSpaceStarted(f.space)?.spaceId ?? null

      const before = await f.spacesCore.get(spaceId)

      unwrap(await f.spacesCore.upsert(f.space))

      const after = await f.spacesCore.get(spaceId)

      expect(before).toEqual(Ok(null))
      expect(after).toEqual(Ok(f.space))
    }
  })

  test('list spaces', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(
        await f.spacesCore.list({
          pagination: { limit: 10, offset: 0 },
        }),
      )

      unwrap(await f.spacesCore.upsert(f.space))

      const after = unwrap(
        await f.spacesCore.list({
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

      const before = await f.spacesCore.hasEvent(spaceId, eventId)

      unwrap(await f.spacesCore.upsert(f.space))

      const after = await f.spacesCore.hasEvent(spaceId, eventId)

      expect(before).toEqual(false)
      expect(after).toEqual(true)
    }
  })

  test('update', async () => {
    const spaceId = SpaceId.generate()
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesCore.get(spaceId))
      await f.spacesCore.update(
        withEventId({
          t: 'user-started-space',
          spaceId: spaceId,
          userId: UserId.generate(),
        }),
      )
      const after = unwrap(await f.spacesCore.get(spaceId))
      expect(Space.toSpaceStarted(before)).toEqual(null)
      expect(Space.toSpaceStarted(after)?.type).toEqual('started')
    }
  })

  test('get with fallback', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesCore.get(f.spaceId)) ?? Space.init
      unwrap(await f.spacesCore.upsert(f.space))
      const after = unwrap(await f.spacesCore.get(f.spaceId)) ?? Space.init
      expect(EventSourced.toState(Space.config, before).type).toEqual('initial')
      expect(EventSourced.toState(Space.config, after).type).toEqual('started')
    }
  })

  test("multiple spaces don't collide", async () => {
    for (const f1 of await Fixtures()) {
      for (const f2 of await Fixtures()) {
        unwrap(await f1.spacesCore.upsert(f1.space))
        unwrap(await f2.spacesCore.upsert(f2.space))
        const after1 = unwrap(await f1.spacesCore.get(f1.spaceId))
        const after2 = unwrap(await f2.spacesCore.get(f2.spaceId))
        expect(after1).toMatchObject(f1.space)
        expect(after2).toMatchObject(f2.space)
      }
    }
  })

  test('error when db has invalid data', async () => {
    for (const f of await Fixtures()) {
      unwrap(await f.spacesCore.upsert(f.space))
      const before = await f.spacesCore.get(f.spaceId)
      const invalid = toInvalidSpaceModel(f.space)
      await f._dangerouslyOverrideModel.pub(invalid)
      await sleep(TimeSpan.milliseconds(100))
      const after = await f.spacesCore.get(f.spaceId)
      expect(before).toEqual(Ok(f.space))
      expect(after).not.toEqual(Ok(f.space))
      expect(after.t).toEqual('err')
      expect(before).toEqual(Ok(f.space))
    }
  })
})

const toInvalidSpaceModel = (space: Space.Model) => {
  const latestEventId = space.snapshots._orderNewestFirst[0]

  if (!latestEventId) throw new Error('latestEventId not found')

  const latestSnapshot = space.snapshots._valuesByKey[latestEventId]

  if (!latestSnapshot) throw new Error('latestSnapshot not found')

  const invalidSnapshot: Partial<SpaceState.Started> = {
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
      invalidSnapshot,
    ),
  }

  return corrupted
}

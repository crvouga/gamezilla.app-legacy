import { describe, expect, it, test } from 'bun:test'
import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { EventSourced } from '~/@/event-sourced'
import { sleep } from '~/@/promise/sleep'
import { unwrap } from '~/@/result'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../../space/space'
import { SpaceState } from '../../space/space-state'
import { Config, SpacesDb } from './impl'

const Fixture = async (config: Config) => {
  const _dangerouslyOverrideModel = Sub.create<Space.Model>()
  const spacesDb = await SpacesDb({
    ...config,
    _dangerouslyOverrideModel,
  })
  const spaceId = SpaceId.generate()
  const space = Space.random({ spaceId: spaceId })

  return {
    _dangerouslyOverrideModel,
    spacesDb,
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

  return Promise.all(configs.map(Fixture))
}

describe('SpacesDb', () => {
  it('should work', async () => {
    for (const f of await Fixtures()) {
      const spaceId = Space.toSpaceStarted(f.space)?.spaceId ?? null

      const before = await f.spacesDb.query({
        pagination: { limit: 1, offset: 0 },
        whereAnd: { equalsSpaceId: spaceId },
      })

      unwrap(await f.spacesDb.upsert(f.space))

      const after = await f.spacesDb.query({
        pagination: { limit: 1, offset: 0 },
        whereAnd: { equalsSpaceId: spaceId },
      })

      expect(unwrap(before).items).toEqual([])
      expect(unwrap(after).items).toEqual([f.space])
    }
  })

  test('list spaces', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(
        await f.spacesDb.query({
          pagination: { limit: 10, offset: 0 },
        }),
      )

      unwrap(await f.spacesDb.upsert(f.space))

      const after = unwrap(
        await f.spacesDb.query({
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

  test('get with fallback', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(
        await f.spacesDb.query({ pagination: { limit: 1, offset: 0 }, whereAnd: { equalsSpaceId: f.spaceId } }),
      )

      unwrap(await f.spacesDb.upsert(f.space))

      const after = unwrap(
        await f.spacesDb.query({ pagination: { limit: 1, offset: 0 }, whereAnd: { equalsSpaceId: f.spaceId } }),
      )
      expect(EventSourced.toState(Space.config, before.items[0] ?? Space.init)?.type).toEqual('initial')
      expect(EventSourced.toState(Space.config, after.items[0] ?? Space.init)?.type).toEqual('started')
    }
  })

  test("multiple spaces don't collide", async () => {
    for (const f1 of await Fixtures()) {
      for (const f2 of await Fixtures()) {
        unwrap(await f1.spacesDb.upsert(f1.space))
        unwrap(await f2.spacesDb.upsert(f2.space))
        const after1 = unwrap(
          await f1.spacesDb.query({ pagination: { limit: 1, offset: 0 }, whereAnd: { equalsSpaceId: f1.spaceId } }),
        )
        const after2 = unwrap(
          await f2.spacesDb.query({ pagination: { limit: 1, offset: 0 }, whereAnd: { equalsSpaceId: f2.spaceId } }),
        )
        expect(after1.items[0]).toMatchObject(f1.space)
        expect(after2.items[0]).toMatchObject(f2.space)
      }
    }
  })

  test('error when db has invalid data', async () => {
    for (const f of await Fixtures()) {
      unwrap(await f.spacesDb.upsert(f.space))
      const before = await f.spacesDb.query({
        pagination: { limit: 1, offset: 0 },
        whereAnd: { equalsSpaceId: f.spaceId },
      })
      const invalid = toInvalidSpaceModel(f.space)
      await f._dangerouslyOverrideModel.pub(invalid)
      await sleep(TimeSpan.milliseconds(100))
      const after = await f.spacesDb.query({
        pagination: { limit: 1, offset: 0 },
        whereAnd: { equalsSpaceId: f.spaceId },
      })
      expect(unwrap(before).items).toEqual([f.space])
      expect(after.t).toEqual('err')
      expect(unwrap(before).items).toEqual([f.space])
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

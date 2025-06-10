import { describe, expect, it, test } from 'bun:test'
import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { EventSourced } from '~/@/event-sourced'
import { sleep } from '~/@/promise/sleep'
import { unwrap } from '~/@/result'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '..'
import { SpaceProjection } from '../../space-projection'
import { Config, SpaceDb } from './impl'
import { SpaceDbInputMsg, SpaceDbOutputMsg } from './interface'

const Fixture = async (config: Config) => {
  const input = Sub.create<SpaceDbInputMsg>()
  const output = Sub.create<SpaceDbOutputMsg>()
  const spacesDb = await SpaceDb({ ...config, input, output })
  const spaceId = SpaceId.generate()
  const space = Space.random({ spaceId: spaceId })

  return {
    input,
    output,
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
    namespace: uniqueNamespace(),
  })

  configs.push({
    t: 'sql-db',
    sqlDb: f.sqlDbSqlite,
    logger: f.logger,
    shouldCreateTable: true,
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql-db',
      sqlDb: f.sqlDbPostgres,
      logger: f.logger,
      shouldCreateTable: false,
    })

    configs.push({
      t: 'key-value-db',
      keyValueDb: f.keyValueDbRedis,
      logger: f.logger,
      namespace: uniqueNamespace(),
    })

    configs.push({
      t: 'key-value-db',
      keyValueDb: f.keyValueDbPostgres,
      logger: f.logger,
      namespace: uniqueNamespace(),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('SpaceDb', () => {
  it('should work', async () => {
    for (const f of await Fixtures()) {
      const spaceId = Space.toSpaceStarted(f.space)?.spaceId ?? SpaceId.generate()

      const before = await f.spacesDb.get([spaceId])

      unwrap(await f.spacesDb.upsert(f.space))

      const after = await f.spacesDb.get([spaceId])

      expect(unwrap(before)).toEqual([])
      expect(unwrap(after)).toEqual([f.space])
    }
  })

  test('query by space id', async () => {
    for (const f of await Fixtures()) {
      unwrap(await f.spacesDb.upsert(Space.random({ spaceId: SpaceId.generate() })))
      unwrap(await f.spacesDb.upsert(Space.random({ spaceId: SpaceId.generate() })))
      unwrap(await f.spacesDb.upsert(Space.random({ spaceId: SpaceId.generate() })))

      const spaceId = Space.toSpaceStarted(f.space)?.spaceId ?? SpaceId.generate()

      const before = await f.spacesDb.get([spaceId])

      unwrap(await f.spacesDb.upsert(f.space))

      const after = await f.spacesDb.get([spaceId])

      expect(unwrap(before)).toEqual([])
      expect(unwrap(after)).toEqual([f.space])
    }
  })

  test('list spaces', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesDb.get([f.spaceId]))

      unwrap(await f.spacesDb.upsert(f.space))

      const after = unwrap(await f.spacesDb.get([f.spaceId]))

      expect(before).toEqual([])
      expect(after).toEqual([f.space])
    }
  })

  test('get with fallback', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesDb.get([f.spaceId]))

      unwrap(await f.spacesDb.upsert(f.space))

      const after = unwrap(await f.spacesDb.get([f.spaceId]))
      expect(EventSourced.toProjection(Space.config, before[0] ?? Space.init)?.type).toEqual('initial')
      expect(EventSourced.toProjection(Space.config, after[0] ?? Space.init)?.type).toEqual('started')
    }
  })

  test("multiple spaces don't collide", async () => {
    for (const f1 of await Fixtures()) {
      for (const f2 of await Fixtures()) {
        unwrap(await f1.spacesDb.upsert(f1.space))
        unwrap(await f2.spacesDb.upsert(f2.space))
        const after1 = unwrap(await f1.spacesDb.get([f1.spaceId]))
        const after2 = unwrap(await f2.spacesDb.get([f2.spaceId]))
        expect(after1).toEqual([f1.space])
        expect(after2).toEqual([f2.space])
      }
    }
  })

  test('error when db has invalid data', async () => {
    for (const f of await Fixtures()) {
      unwrap(await f.spacesDb.upsert(f.space))
      const before = await f.spacesDb.get([f.spaceId])
      const invalid = toInvalidSpaceModel(f.space)
      const p = Sub.take(Sub.where(f.output, (m): m is SpaceDbOutputMsg => m.t === 'model-dangerously-overridden'))
      await f.input.pub({ t: 'dangerously-override-model', model: invalid })
      await p
      await sleep(TimeSpan.milliseconds(100))
      const after = await f.spacesDb.get([f.spaceId])
      expect(unwrap(before)).toEqual([f.space])
      expect(unwrap(after)).toEqual([])
    }
  })
})

const toInvalidSpaceModel = (space: Space.Model) => {
  const latestEventId = space.snapshots._orderNewestFirst[0]

  if (!latestEventId) throw new Error('latestEventId not found')

  const latestSnapshot = space.snapshots._valuesByKey[latestEventId]

  if (!latestSnapshot) throw new Error('latestSnapshot not found')

  const invalidSnapshot: Partial<SpaceProjection.Started> = {
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

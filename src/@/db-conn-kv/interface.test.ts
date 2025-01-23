import { describe, expect, it, test } from 'bun:test'
import { p } from '~/@/parser'
import { Ok, Result } from '~/@/result'
import { Runtime } from '~/@/runtime'
import { CONFIG_BACKEND } from '~/config/backend'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { Logger } from '../logger'
import { PubSub } from '../pub-sub'
import { TimeSpan } from '../time/time-span'
import { Uuid } from '../uuid/uuid'
import { KeyValueDb } from './impl'
import { CONFIG_SHARED } from '~/config/shared'

const Fixture = async () => {
  const testEnv = await FixtureAppBackend()
  const logger = Logger({ t: 'noop' })

  switch (testEnv.t) {
    case 'integration': {
      const keyValueDb = testEnv.keyValueDb

      return {
        logger,
        keyValueDb,
      }
    }

    case 'unit': {
      const keyValueDb = await KeyValueDb({ t: 'hash-map' })

      return {
        logger,
        keyValueDb,
      }
    }
  }
}

type Implementation = {
  name: string
  Fixture: () => ReturnType<typeof Fixture>
}

const Fixtures = (): Implementation[] => {
  const fixtures: Implementation[] = [
    {
      name: 'base',
      Fixture,
    },
    {
      name: 'with-cache',
      async Fixture() {
        const f = await Fixture()
        return {
          ...f,
          keyValueDb: await KeyValueDb({
            t: 'with-cache',
            cache: await KeyValueDb({
              t: 'hash-map',
            }),
            source: f.keyValueDb,
            logger: f.logger,
          }),
        }
      },
    },
    {
      name: 'with-reduced-parsing',
      async Fixture() {
        const f = await Fixture()
        return {
          ...f,
          keyValueDb: await KeyValueDb({
            t: 'with-reduced-parsing',
            keyValueDb: f.keyValueDb,
            verifiedKeys: new Set(),
            logger: f.logger,
          }),
        }
      },
    },
    {
      name: 'with-throttled-writes-to-source',
      async Fixture() {
        const f = await Fixture()
        return {
          ...f,
          keyValueDb: await KeyValueDb({
            t: 'with-cache',
            cache: await KeyValueDb({
              t: 'hash-map',
            }),
            source: await KeyValueDb({
              t: 'with-throttled-writes',
              keyValueDb: f.keyValueDb,
              logger: f.logger,
              throttle: TimeSpan.seconds(10),
              runtime: Runtime({ t: 'noop' }),
            }),
            logger: f.logger,
          }),
        }
      },
    },
    {
      name: 'with-distributed-invalidations-for-cache',
      async Fixture() {
        const f = await Fixture()
        return {
          ...f,
          keyValueDb: await KeyValueDb({
            t: 'with-cache',
            source: f.keyValueDb,
            logger: f.logger,
            cache: await KeyValueDb({
              t: 'with-distributed-invalidations',
              cache: await KeyValueDb({ t: 'hash-map' }),
              logger: f.logger,
              pubSub: await PubSub({ t: 'in-memory' }),
            }),
          }),
        }
      },
    },
  ]

  if (CONFIG_SHARED.IS_INTEGRATION_TEST) {
    fixtures.push({
      name: 'redis',
      async Fixture() {
        const f = await Fixture()
        return {
          ...f,
          keyValueDb: await KeyValueDb({
            t: 'redis',
            simulateLatency: async () => {},
            redisUrl: CONFIG_BACKEND.REDIS_URL,
            logger: f.logger,
          }),
        }
      },
    })
  }

  return fixtures
}

const Item = p.obj({ id: p.str })

type Item = p.Infer<typeof Item>

const randomItem = (): Item => {
  return {
    id: Uuid.generate(),
  }
}

const normalizeItemArray = (items: Item[]): Item[] => {
  return items.sort((a, b) => a.id.localeCompare(b.id))
}

const normalizeItemArrayResult = <T>(result: Result<T, Item[]>): Result<T, Item[]> => {
  return Result.mapOk(result, normalizeItemArray)
}

describe(`${import.meta.file} ${name}`, () => {
  it('should set correctly', async () => {
    for (const { Fixture } of Fixtures()) {
      const f = await Fixture()

      const item = randomItem()

      const before = await f.keyValueDb.get(item.id, Item)
      await f.keyValueDb.set(item.id, item)
      const after = await f.keyValueDb.get(item.id, Item)

      expect(before).toEqual(Ok(null))
      expect(after).toEqual(Ok(item))
    }
  })

  test('setMany empty input', async () => {
    for (const { Fixture } of Fixtures()) {
      const f = await Fixture()

      const set = await f.keyValueDb.setMany([])

      expect(set).toEqual(Ok(null))
    }
  })

  it('should set many correctly', async () => {
    for (const { Fixture } of Fixtures()) {
      const f = await Fixture()

      const items = [randomItem(), randomItem(), randomItem()]

      const before = await f.keyValueDb.getMany(
        items.map((item) => item.id),
        Item,
      )

      await f.keyValueDb.setMany(items.map((item) => [item.id, item]))

      const after = await f.keyValueDb.getMany(
        items.map((item) => item.id),
        Item,
      )

      expect(before).toEqual(Ok([]))
      expect(normalizeItemArrayResult(after)).toEqual(normalizeItemArrayResult(Ok(items)))
    }
  })

  it('should get correctly', async () => {
    for (const { Fixture } of Fixtures()) {
      const f = await Fixture()

      const item = randomItem()

      await f.keyValueDb.set(item.id, item)

      const got = await f.keyValueDb.get(item.id, Item)

      expect(got).toEqual(Ok(item))
    }
  })

  it('should get many correctly', async () => {
    for (const { Fixture } of Fixtures()) {
      const f = await Fixture()

      const items = [randomItem(), randomItem(), randomItem()]

      await f.keyValueDb.setMany(items.map((item) => [item.id, item]))

      const got = await f.keyValueDb.getMany(
        items.map((item) => item.id),
        Item,
      )

      expect(got).toEqual(Ok(items))
    }
  })

  test('get many empty', async () => {
    for (const { Fixture } of Fixtures()) {
      const f = await Fixture()

      const items = [randomItem(), randomItem(), randomItem()]
      await f.keyValueDb.setMany(items.map((item) => [item.id, item]))

      const got = await f.keyValueDb.getMany([], Item)

      expect(got).toEqual(Ok([]))
    }
  })

  it('should zap items correctly', async () => {
    for (const { Fixture } of Fixtures()) {
      const f = await Fixture()

      const item = randomItem()

      await f.keyValueDb.set(item.id, item)

      const before = await f.keyValueDb.get(item.id, Item)

      await f.keyValueDb.zap(item.id)

      const after = await f.keyValueDb.get(item.id, Item)

      expect(before).toEqual(Ok(item))
      expect(after).toEqual(Ok(null))
    }
  })
})

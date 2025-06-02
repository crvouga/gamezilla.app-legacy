import { describe, expect, it, test } from 'bun:test'
import { s } from '~/@/schema'
import { Ok, Result } from '~/@/result'
import { Runtime } from '~/@/runtime'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { PubSub } from '../pub-sub'
import { TimeSpan } from '../time/time-span'
import { Uuid } from '../id/uuid'
import { KeyValueDb } from './impl'
import { IKeyValueDb } from './interface'
import { Logger } from '../logger'
import { SqlDb } from '../sql-db/backend/impl'

type Fixture = {
  name: string
  keyValueDb: IKeyValueDb
}
const Fixtures = async (): Promise<Fixture[]> => {
  const logger = Logger({ t: 'noop' })

  const fixtures: Fixture[] = []

  fixtures.push({
    name: 'hash-map',
    keyValueDb: await KeyValueDb({
      t: 'hash-map',
      logger,
    }),
  })

  fixtures.push({
    name: 'with-cache',
    keyValueDb: await KeyValueDb({
      t: 'with-cache',
      cache: await KeyValueDb({
        t: 'hash-map',
      }),
      source: await KeyValueDb({
        t: 'hash-map',
        logger,
      }),
      logger,
    }),
  })

  fixtures.push({
    name: 'with-reduced-parsing',
    keyValueDb: await KeyValueDb({
      t: 'with-reduced-parsing',
      keyValueDb: await KeyValueDb({
        t: 'hash-map',
        logger,
      }),
      verifiedKeys: new Set(),
      logger,
    }),
  })

  fixtures.push({
    name: 'with-throttled-writes-to-source',
    keyValueDb: await KeyValueDb({
      t: 'with-cache',
      cache: await KeyValueDb({
        t: 'hash-map',
      }),
      source: await KeyValueDb({
        t: 'with-throttled-writes',
        keyValueDb: await KeyValueDb({
          t: 'hash-map',
          logger,
        }),
        logger,
        throttle: TimeSpan.seconds(10),
        runtime: Runtime({ t: 'noop' }),
      }),
      logger,
    }),
  })

  fixtures.push({
    name: 'with-distributed-invalidations-for-cache',
    keyValueDb: await KeyValueDb({
      t: 'with-cache',
      source: await KeyValueDb({
        t: 'hash-map',
        logger,
      }),
      logger,
      cache: await KeyValueDb({
        t: 'with-distributed-invalidations',
        cache: await KeyValueDb({ t: 'hash-map' }),
        logger,
        pubSub: await PubSub({ t: 'in-memory' }),
      }),
    }),
  })

  const dbConnSqlSqlite = await SqlDb({
    t: 'bun-sqlite',
    logger,
    fileSystem: {
      t: 'in-memory',
    },
  })

  fixtures.push({
    name: 'sqlite',
    keyValueDb: await KeyValueDb({
      t: 'with-sql-tables',
      dbConnSql: dbConnSqlSqlite,
      keyValueDb: await KeyValueDb({
        t: 'db-conn-sql',
        dbConnSql: dbConnSqlSqlite,
        logger,
      }),
    }),
  })

  if (CONFIG_SHARED.IS_INTEGRATION_TEST) {
    fixtures.push({
      name: 'redis',
      keyValueDb: await KeyValueDb({
        t: 'redis',
        simulateLatency: async () => {},
        redisUrl: CONFIG_BACKEND.REDIS_URL,
        logger,
      }),
    })

    fixtures.push({
      name: 'postgres',
      keyValueDb: await KeyValueDb({
        t: 'db-conn-sql',
        dbConnSql: await SqlDb({
          t: 'postgres',
          logger,
          databaseUrl: CONFIG_BACKEND.DATABASE_URL,
        }),
        logger,
      }),
    })
  }

  return fixtures
}

const Item = s.obj({ id: s.str() })

type Item = s.Infer<typeof Item>

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

describe(`KeyValueDb`, () => {
  it('should set correctly', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const item = randomItem()

      const before = await fixture.keyValueDb.get(item.id, Item)
      await fixture.keyValueDb.set(item.id, item)
      const after = await fixture.keyValueDb.get(item.id, Item)

      expect(before).toEqual(Ok(null))
      expect(after).toEqual(Ok(item))
    }
  })

  test('setMany empty input', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const set = await fixture.keyValueDb.setMany([])

      expect(set).toEqual(Ok(null))
    }
  })

  it('should set many correctly', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const items = [randomItem(), randomItem(), randomItem()]

      const before = await fixture.keyValueDb.getMany(
        items.map((item) => item.id),
        Item,
      )

      await fixture.keyValueDb.setMany(items.map((item) => [item.id, item]))

      const after = await fixture.keyValueDb.getMany(
        items.map((item) => item.id),
        Item,
      )

      expect(before).toEqual(Ok([]))
      expect(normalizeItemArrayResult(after)).toEqual(normalizeItemArrayResult(Ok(items)))
    }
  })

  it('should get correctly', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const item = randomItem()

      await fixture.keyValueDb.set(item.id, item)

      const got = await fixture.keyValueDb.get(item.id, Item)

      expect(got).toEqual(Ok(item))
    }
  })

  it('should get many correctly', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const items = [randomItem(), randomItem(), randomItem()]

      await fixture.keyValueDb.setMany(items.map((item) => [item.id, item]))

      const got = await fixture.keyValueDb.getMany(
        items.map((item) => item.id),
        Item,
      )
      expect(got).toEqual(Ok(items))
    }
  })

  test('get many empty', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const items = [randomItem(), randomItem(), randomItem()]
      await fixture.keyValueDb.setMany(items.map((item) => [item.id, item]))

      const got = await fixture.keyValueDb.getMany([], Item)

      expect(got).toEqual(Ok([]))
    }
  })

  it('should zap items correctly', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const item = randomItem()

      await fixture.keyValueDb.set(item.id, item)

      const before = await fixture.keyValueDb.get(item.id, Item)

      await fixture.keyValueDb.zap(item.id)

      const after = await fixture.keyValueDb.get(item.id, Item)

      expect(before).toEqual(Ok(item))
      expect(after).toEqual(Ok(null))
    }
  })

  it.skip('should handle overwriting existing keys', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const key = 'test-key'
      const initialItem = randomItem()
      initialItem.id = key
      const updatedItem = randomItem()
      updatedItem.id = key

      // Set initial value
      await fixture.keyValueDb.set(key, initialItem)
      const initial = await fixture.keyValueDb.get(key, Item)
      expect(initial).toEqual(Ok(initialItem))

      // Overwrite with new value
      await fixture.keyValueDb.set(key, updatedItem)
      const updated = await fixture.keyValueDb.get(key, Item)
      expect(updated).toEqual(Ok(updatedItem))
      expect(updated).not.toEqual(initial)
    }
  })
})

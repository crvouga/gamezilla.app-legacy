import { describe, expect, it, test } from 'bun:test'
import { Ok, Result, TimeSpan, Uuid } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { REDIS_URL } from 'gamezilla-app/config-private'
import { Logger } from '../logger'
import { PubSub } from '../pub-sub'
import { AppServerTestEnv } from '../server-test-env'
import { DbConnKv } from './impl'

const Fixture = async () => {
  const testEnv = await AppServerTestEnv()
  const logger = Logger({ t: 'noop' })

  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      const dbConnKv = testEnv.dbConnKv

      return {
        logger,
        dbConnKv
      }
    }

    case 'unit': {
      const dbConnKv = await DbConnKv({ t: 'hash-map' })

      return {
        logger,
        dbConnKv
      }
    }
  }
}

type Implementation = {
  name: string
  Fixture: () => ReturnType<typeof Fixture>
}

const implementations: Implementation[] = [
  {
    name: 'base',
    Fixture
  },
  {
    name: 'with-cache',
    async Fixture() {
      const f = await Fixture()
      return {
        ...f,
        dbConnKv: DbConnKv.withCache({
          cache: await DbConnKv({
            t: 'hash-map'
          }),
          source: f.dbConnKv,
          logger: f.logger
        })
      }
    }
  },
  {
    name: 'with-reduced-parsing',
    async Fixture() {
      const f = await Fixture()
      return {
        ...f,
        dbConnKv: DbConnKv.withReducedParsing({
          dbConnKv: f.dbConnKv,
          verifiedKeys: new Set(),
          logger: f.logger
        })
      }
    }
  },
  {
    name: 'with-throttled-writes-to-source',
    async Fixture() {
      const f = await Fixture()
      return {
        ...f,
        dbConnKv: DbConnKv.withCache({
          cache: await DbConnKv({
            t: 'hash-map'
          }),
          source: DbConnKv.withThrottledWrites({
            dbConnKv: f.dbConnKv,
            logger: f.logger,
            throttle: TimeSpan.seconds(10)
          }),
          logger: f.logger
        })
      }
    }
  },

  {
    name: 'with-distributed-invalidations-for-cache',
    async Fixture() {
      const f = await Fixture()
      return {
        ...f,
        dbConnKv: DbConnKv.withCache({
          source: f.dbConnKv,
          logger: f.logger,
          cache: await DbConnKv.withDistributedInvalidations({
            cache: await DbConnKv({ t: 'hash-map' }),
            logger: f.logger,
            pubSub: await PubSub({ t: 'in-memory' })
          })
        })
      }
    }
  },

  {
    name: 'redis',
    async Fixture() {
      const f = await Fixture()
      return {
        ...f,
        dbConnKv: await DbConnKv({
          t: 'redis',
          simulateLatency: async () => {},
          redisUrl: REDIS_URL,
          logger: f.logger
        })
      }
    }
  }
]

const Item = p.obj({ id: p.str })

type Item = p.Infer<typeof Item>

const randomItem = (): Item => {
  return {
    id: Uuid.generate()
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
    for (const { Fixture } of implementations) {
      const f = await Fixture()

      const item = randomItem()

      const before = await f.dbConnKv.get(item.id, Item)
      await f.dbConnKv.set(item.id, item)
      const after = await f.dbConnKv.get(item.id, Item)

      expect(before).toEqual(Ok(null))
      expect(after).toEqual(Ok(item))
    }
  })

  test('setMany empty input', async () => {
    for (const { Fixture } of implementations) {
      const f = await Fixture()

      const set = await f.dbConnKv.setMany([])

      expect(set).toEqual(Ok(null))
    }
  })

  it('should set many correctly', async () => {
    for (const { Fixture } of implementations) {
      const f = await Fixture()

      const items = [randomItem(), randomItem(), randomItem()]

      const before = await f.dbConnKv.getMany(
        items.map((item) => item.id),
        Item
      )

      await f.dbConnKv.setMany(items.map((item) => [item.id, item]))

      const after = await f.dbConnKv.getMany(
        items.map((item) => item.id),
        Item
      )

      expect(before).toEqual(Ok([]))
      expect(normalizeItemArrayResult(after)).toEqual(normalizeItemArrayResult(Ok(items)))
    }
  })

  it('should get correctly', async () => {
    for (const { Fixture } of implementations) {
      const f = await Fixture()

      const item = randomItem()

      await f.dbConnKv.set(item.id, item)

      const got = await f.dbConnKv.get(item.id, Item)

      expect(got).toEqual(Ok(item))
    }
  })

  it('should get many correctly', async () => {
    for (const { Fixture } of implementations) {
      const f = await Fixture()

      const items = [randomItem(), randomItem(), randomItem()]

      await f.dbConnKv.setMany(items.map((item) => [item.id, item]))

      const got = await f.dbConnKv.getMany(
        items.map((item) => item.id),
        Item
      )

      expect(got).toEqual(Ok(items))
    }
  })

  test('get many empty', async () => {
    for (const { Fixture } of implementations) {
      const f = await Fixture()

      const items = [randomItem(), randomItem(), randomItem()]
      await f.dbConnKv.setMany(items.map((item) => [item.id, item]))

      const got = await f.dbConnKv.getMany([], Item)

      expect(got).toEqual(Ok([]))
    }
  })

  it('should zap items correctly', async () => {
    for (const { Fixture } of implementations) {
      const f = await Fixture()

      const item = randomItem()

      await f.dbConnKv.set(item.id, item)

      const before = await f.dbConnKv.get(item.id, Item)

      await f.dbConnKv.zap(item.id)

      const after = await f.dbConnKv.get(item.id, Item)

      expect(before).toEqual(Ok(item))
      expect(after).toEqual(Ok(null))
    }
  })
})

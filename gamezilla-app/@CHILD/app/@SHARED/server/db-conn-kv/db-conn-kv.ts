import { Result, Task } from "gamezilla-app/@SHARED/core"
import { Parser } from "gamezilla-app/@SHARED/core/parser/parser"
import { Logger } from "../logger"

export type IDbConnKv = {
  get: <TValue>(
    key: string,
    parser: Parser<TValue>,
  ) => Task<string, TValue | null>
  getMany: <TValue>(
    keys: string[],
    parser: Parser<TValue>,
  ) => Task<string, TValue[]>
  set: <TValue>(key: string, value: TValue) => Task<string, null>
  setMany: <TValue>(entries: [string, TValue][]) => Task<string, null>
  zap: (key: string) => Task<string, null>
}

const instance = <TKey extends string = string, TValue = unknown>(
  dbConnKv: IDbConnKv,
  namespace: string[],
  parser: Parser<TValue>,
): {
  get: (key: TKey) => Task<string, TValue | null>
  getMany: (keys: TKey[]) => Task<string, TValue[]>
  set: (key: TKey, value: TValue) => Task<string, null>
  setMany: (entries: [TKey, TValue][]) => Task<string, null>
  zap: (key: TKey) => Task<string, null>
} => {
  const toKey = (key: string) => [...namespace, key].join(":")
  return {
    get(key) {
      return dbConnKv.get(toKey(key), parser)
    },
    getMany(keys) {
      const namespacedKeys = keys.map(toKey)
      return dbConnKv.getMany(namespacedKeys, parser)
    },
    set(key, value) {
      return dbConnKv.set(toKey(key), value)
    },
    setMany(entries) {
      const namespacedEntries = entries.map(
        ([key, value]): [string, TValue] => [toKey(key), value],
      )
      return dbConnKv.setMany(namespacedEntries)
    },
    zap(key) {
      return dbConnKv.zap(toKey(key))
    },
  }
}

export const withCache = ({
  cache,
  source,
  logger,
}: {
  cache: IDbConnKv
  source: IDbConnKv
  logger: Logger
}): IDbConnKv => {
  return {
    async get(key, parser) {
      const start = process.hrtime.bigint()

      const cacheGot = await cache.get(key, parser)
      const cacheHit = Result.withDefault(cacheGot, null)
      if (cacheHit) {
        const end = process.hrtime.bigint()
        const durationInMicroseconds = (end - start) / BigInt(1000)
        logger.info(
          `[db-conn-kv] CACHED duration=${durationInMicroseconds}µs get: key=${key}`,
        )
        return cacheGot
      }
      const sourceGot = await source.get(key, parser)
      const sourceHit = Result.withDefault(sourceGot, null)
      if (sourceHit) {
        await cache.set(key, sourceHit)
      }
      const end = process.hrtime.bigint()
      const durationInMicroseconds = (end - start) / BigInt(1000)
      logger.info(
        `[db-conn-kv] duration=${durationInMicroseconds}µs get: key=${key}`,
      )
      return sourceGot
    },
    async getMany(keys, parser) {
      const start = process.hrtime.bigint()

      const cacheGot = await cache.getMany(keys, parser)
      const cacheHit = Result.withDefault(cacheGot, null)
      if (cacheHit) {
        const end = process.hrtime.bigint()
        const durationInMicroseconds = (end - start) / BigInt(1000)
        logger.info(
          `[db-conn-kv] CACHED duration=${durationInMicroseconds}µs get: keys=${keys.join(
            ", ",
          )}`,
        )
        return cacheGot
      }
      const sourceGot = await source.getMany(keys, parser)
      const sourceHit = Result.withDefault(sourceGot, null)
      if (sourceHit) {
        //
      }
      const end = process.hrtime.bigint()
      const durationInMicroseconds = (end - start) / BigInt(1000)
      logger.info(
        `[db-conn-kv] duration=${durationInMicroseconds}µs get: keys=${keys.join(
          ", ",
        )}`,
      )
      return sourceGot
    },
    async set(key, value) {
      source.set(key, value)
      return cache.set(key, value)
    },
    async setMany(entries) {
      source.setMany(entries)
      return cache.setMany(entries)
    },
    async zap(key) {
      source.zap(key)
      return cache.zap(key)
    },
  }
}

export const IDbConnKv = {
  instance,
  withCache,
}

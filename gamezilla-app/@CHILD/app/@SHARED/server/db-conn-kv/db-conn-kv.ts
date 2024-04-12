import {
  PubSub,
  Result,
  Task,
  TimeSpan,
  isErr,
} from "gamezilla-app/@SHARED/core"
import { Parser } from "gamezilla-app/@SHARED/core/parser/parser"
import { Logger } from "../logger"
import { p } from "gamezilla-app/@SHARED/core/parser"

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

const withReducedParsing = ({
  dbConnKv,
  verifiedKeys,
}: {
  dbConnKv: IDbConnKv
  verifiedKeys: Set<string>
}): IDbConnKv => {
  return {
    ...dbConnKv,
    async get<TValue>(key: string, parser: p.Parser<TValue>) {
      if (verifiedKeys.has(key)) {
        return dbConnKv.get(key, p.noop<TValue>())
      }

      const got = await dbConnKv.get(key, parser)

      if (isErr(got)) {
        return got
      }

      verifiedKeys.add(key)

      return got
    },

    async getMany<TValue>(keys: string[], parser: p.Parser<TValue>) {
      const key = keys.join(",")

      if (verifiedKeys.has(key)) {
        return dbConnKv.getMany(keys, p.noop<TValue>())
      }

      const got = await dbConnKv.getMany(keys, parser)

      if (isErr(got)) {
        return got
      }

      verifiedKeys.add(key)

      return got
    },
  }
}

const withCache = ({
  cache,
  source,
  logger,
  writeDebounce,
  cacheInvalidation,
}: {
  cache: IDbConnKv
  source: IDbConnKv
  logger: Logger
  writeDebounce: TimeSpan
  cacheInvalidation?: PubSub<string>
}): IDbConnKv & { cleanUp: () => void } => {
  const writeDebounceMs = TimeSpan.toMilliseconds(writeDebounce)
  const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

  const unsubscribe = cacheInvalidation?.subscribe((key) => {
    logger.info(`[db-conn-kv] INVALIDATING CACHE key=${key}`)
    cache.zap(key)
  })

  return {
    cleanUp() {
      unsubscribe?.()
    },

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
      logger.info(`[db-conn-kv] HITTING SOURCE getMany: key=${key}`)
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
      logger.info(
        `[db-conn-kv] HITTING SOURCE getMany: keys=${keys.join(", ")}`,
      )
      const sourceGot = await source.getMany(keys, parser)
      const sourceHit = Result.withDefault(sourceGot, null)
      if (sourceHit) {
        await cache.setMany(
          sourceHit.map((value, i) => [keys[i], value] as [string, unknown]),
        )
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
      clearTimeout(timeouts.get(key))

      timeouts.set(
        key,
        setTimeout(() => source.set(key, value), writeDebounceMs),
      )

      cacheInvalidation?.publish(key)

      return cache.set(key, value)
    },
    async setMany(entries) {
      let key = ""
      for (let i = 0; i < entries.length; i++) {
        key = key + "," + entries[i]![0]
      }

      clearTimeout(timeouts.get(key))

      timeouts.set(
        key,
        setTimeout(() => source.setMany(entries), writeDebounceMs),
      )

      cacheInvalidation?.publish(key)

      return cache.setMany(entries)
    },
    async zap(key) {
      clearTimeout(timeouts.get(key))

      timeouts.set(
        key,
        setTimeout(() => source.zap(key), writeDebounceMs),
      )

      cacheInvalidation?.publish(key)

      return cache.zap(key)
    },
  }
}

export const IDbConnKv = {
  instance,
  withReducedParsing,
  withCache,
}

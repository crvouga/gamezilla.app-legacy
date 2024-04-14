import { Err, Ok } from "gamezilla-app/@SHARED/core"
import { createClient } from "redis"
import { Logger } from "../logger"
import { IDbConnKv } from "./db-conn-kv"

export const DbConnKvRedis = async ({
  url,
  logger,
}: {
  url: string
  logger: Logger
}): Promise<IDbConnKv> => {
  // https://github.com/redis/node-redis
  const client = await createClient({
    url,
  }).connect()

  logger.info(`[db-conn-kv-redis] connected`)

  return {
    async get(key, parser) {
      try {
        const start = process.hrtime.bigint()

        const got = await client.get(key)

        const end = process.hrtime.bigint()

        const durationInMicroseconds = (end - start) / BigInt(1000)

        logger.info(
          `[db-conn-kv] duration=${durationInMicroseconds}µs get: key=${key}`,
        )

        if (got === null || got === undefined) {
          return Ok(null)
        }

        const json = JSON.parse(got)

        const parsed = parser.parse(json)

        if (parsed.t === "ok") {
          return Ok(parsed.value)
        }

        logger.error(
          `[db-conn-kv-redis] get: not a value: ${key} ${JSON.stringify(
            parsed.error,
            null,
            2,
          )}`,
        )

        return Ok(null)
      } catch (e) {
        return Err(String(e))
      }
    },

    async getMany(keys, parser) {
      try {
        const start = process.hrtime.bigint()

        const got = await client.mGet(keys)

        const end = process.hrtime.bigint()

        const durationInMicroseconds = (end - start) / BigInt(1000)

        logger.info(
          `[db-conn-kv] duration=${durationInMicroseconds}µs getMany: keys=${keys}`,
        )

        return Ok(
          got.flatMap((value) => {
            if (value === null || value === undefined) {
              return []
            }

            const json = JSON.parse(value)

            const parsed = parser.parse(json)

            if (parsed.t === "ok") {
              return parsed.value
            }

            logger.error(
              `[db-conn-kv-redis] getMany: not a value: ${keys} ${JSON.stringify(
                parsed.error,
                null,
                2,
              )}`,
            )

            return []
          }),
        )
      } catch (e) {
        logger.error(`[db-conn-kv-redis] getMany: ${String(e)}`)
        return Err(String(e))
      }
    },

    async set(key, value) {
      try {
        await client.set(key, JSON.stringify(value))
        logger.info(`[db-conn-kv-redis] set: key=${key}`)
        return Ok(null)
      } catch (e) {
        logger.error(`[db-conn-kv-redis] set: ${String(e)}`)
        return Err(String(e))
      }
    },

    async setMany(entries) {
      try {
        await client.mSet(
          entries.flatMap(([key, value]) => [key, JSON.stringify(value)]),
        )
        logger.info(
          `[db-conn-kv-redis] setMany: keys=${entries.map(([key]) => key)}`,
        )
        return Ok(null)
      } catch (e) {
        logger.error(`[db-conn-kv-redis] setMany: ${String(e)}`)
        return Err(String(e))
      }
    },

    async zap(key) {
      try {
        await client.del(key)
        logger.info(`[db-conn-kv-redis] zap: key=${key}`)
        return Ok(null)
      } catch (e) {
        logger.error(`[db-conn-kv-redis] zap: ${String(e)}`)
        return Err(String(e))
      }
    },
  }
}

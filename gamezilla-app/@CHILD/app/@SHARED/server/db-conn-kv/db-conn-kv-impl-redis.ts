import { Err, Ok } from "gamezilla-app/@SHARED/core"
import { createClient } from "redis"
import { ILogger } from "../logger/logger"
import { IDbConnKv } from "./db-conn-kv"

declare global {
  var redisClient: Awaited<
    ReturnType<ReturnType<typeof createClient>["connect"]>
  >
}

export const DbConnKvRedis = async ({
  url,
  logger,
}: {
  url: string
  logger: ILogger
}): Promise<IDbConnKv> => {
  // https://github.com/redis/node-redis
  globalThis.redisClient ??= await createClient({
    url,
  }).connect()

  logger.info(`connected`)

  return {
    async get(key, parser) {
      try {
        const start = process.hrtime.bigint()

        const got = await globalThis.redisClient.get(key)

        const end = process.hrtime.bigint()

        const durationInMicroseconds = (end - start) / BigInt(1000)

        logger.info(`duration=${durationInMicroseconds}µs get: key=${key}`)

        if (got === null || got === undefined) {
          return Ok(null)
        }

        const json = JSON.parse(got)

        const parsed = parser.parse(json)

        if (parsed.t === "ok") {
          return Ok(parsed.value)
        }

        logger.error(
          `get: not a value: ${key} ${JSON.stringify(parsed.error, null, 2)}`,
        )

        return Ok(null)
      } catch (e) {
        return Err(String(e))
      }
    },

    async getMany(keys, parser) {
      try {
        const start = process.hrtime.bigint()

        const got = await globalThis.redisClient.mGet(keys)

        const end = process.hrtime.bigint()

        const durationInMicroseconds = (end - start) / BigInt(1000)

        logger.info(
          `duration=${durationInMicroseconds}µs getMany: keys=${keys}`,
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
              `getMany: not a value: ${keys} ${JSON.stringify(
                parsed.error,
                null,
                2,
              )}`,
            )

            return []
          }),
        )
      } catch (e) {
        logger.error(`getMany: ${String(e)}`)
        return Err(String(e))
      }
    },

    async set(key, value) {
      try {
        await globalThis.redisClient.set(key, JSON.stringify(value))
        logger.info(`set: key=${key}`)
        return Ok(null)
      } catch (e) {
        logger.error(`set: ${String(e)}`)
        return Err(String(e))
      }
    },

    async setMany(entries) {
      try {
        await globalThis.redisClient.mSet(
          entries.flatMap(([key, value]) => [key, JSON.stringify(value)]),
        )
        logger.info(`setMany: keys=${entries.map(([key]) => key)}`)
        return Ok(null)
      } catch (e) {
        logger.error(`setMany: ${String(e)}`)
        return Err(String(e))
      }
    },

    async zap(key) {
      try {
        await globalThis.redisClient.del(key)
        logger.info(`zap: key=${key}`)
        return Ok(null)
      } catch (e) {
        logger.error(`zap: ${String(e)}`)
        return Err(String(e))
      }
    },
  }
}

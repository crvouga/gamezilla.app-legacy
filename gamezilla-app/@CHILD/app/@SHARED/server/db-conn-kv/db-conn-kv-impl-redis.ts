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
          `[db-conn-kv-redis] get: not a value: ${key} ${parsed.error}`,
        )

        return Ok(null)
      } catch (e) {
        return Err(String(e))
      }
    },

    async set(key, value) {
      try {
        await client.set(key, JSON.stringify(value))
        return Ok(null)
      } catch (e) {
        return Err(String(e))
      }
    },

    async setMany(entries) {
      try {
        await client.mSet(
          entries.map(([key, value]) => [key, JSON.stringify(value)]),
        )
        return Ok(null)
      } catch (e) {
        return Err(String(e))
      }
    },

    async zap(key) {
      try {
        await client.del(key)
        return Ok(null)
      } catch (e) {
        return Err(String(e))
      }
    },
  }
}

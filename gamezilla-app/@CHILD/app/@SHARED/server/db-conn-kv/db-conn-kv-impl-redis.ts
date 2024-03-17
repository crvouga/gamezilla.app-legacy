import { createClient } from "redis"
import { err, ok } from "gamezilla-app/@SHARED/core"
import { DbConnKv } from "./db-conn-kv"
import { Logger } from "../logger"

export const createDbConnKvRedis = async ({
  url,
  logger,
}: {
  url: string
  logger: Logger
}): Promise<DbConnKv> => {
  // https://github.com/redis/node-redis
  const client = await createClient({
    url,
  }).connect()

  logger.info(`[db-conn-kv-redis] connected`)

  return {
    async get(key, isValue) {
      try {
        const got = await client.get(key)

        if (got === null || got === undefined) {
          return ok(null)
        }

        const parsed = JSON.parse(got)

        if (isValue(parsed)) {
          return ok(parsed)
        }

        logger.error(`[db-conn-kv-redis] get: not a value: ${key} value=${got}`)

        return ok(null)
      } catch (e) {
        return err(String(e))
      }
    },

    async set(key, value) {
      try {
        await client.set(key, JSON.stringify(value))
        return ok(null)
      } catch (e) {
        return err(String(e))
      }
    },

    async zap(key) {
      try {
        await client.del(key)
        return ok(null)
      } catch (e) {
        return err(String(e))
      }
    },
  }
}

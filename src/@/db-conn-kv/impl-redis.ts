import { Logger } from '~/@/logger'
import type { ILogger } from '~/@/logger/interface'
import { p } from '~/@/parser'
import { Sleep } from '~/@/promise/sleep'
import { Err, Ok, isErr } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'
import { withDuration } from '~/@/time/with-duration'
import { IRedis, newRedis } from '../redis'
import { SecretString } from '../secrets/secret-string'
import type { IDbConnKv } from './interface'

export type Config = {
  t: 'redis'
  logger: ILogger
  redisUrl: SecretString
  simulateLatency: Sleep
}

let redis: IRedis

export const DbConnKv = async (config: Config): Promise<IDbConnKv> => {
  const logger = Logger.prefix('redis', config.logger)

  redis ??= await newRedis(config.redisUrl)

  const SIMULATE_LATENCY = TimeSpan.milliseconds(3)

  return {
    async get(key, parser) {
      await config.simulateLatency(SIMULATE_LATENCY)
      try {
        const [queried, duration] = await withDuration(() => redis.get(key))
        logger.debug(`duration=${TimeSpan.toMilliseconds(duration)}ms get: key=${key}`)

        if (!queried) {
          return Ok(null)
        }

        const json = JSON.parse(queried)

        const parsed = parser.parse(json)

        switch (parsed.t) {
          case 'err': {
            const errorStr = JSON.stringify(parsed.error, null, 2)

            logger.error(`get: not a value: ${key} ${errorStr}`)

            return Ok(null)
          }
          case 'ok': {
            return parsed
          }
        }
      } catch (e) {
        logger.error(`get: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },

    async getMany(keys, parser) {
      await config.simulateLatency(SIMULATE_LATENCY)
      if (keys.length <= 0) {
        return Ok([])
      }
      try {
        const [queried, duration] = await withDuration(() => redis.mget(keys))

        logger.debug(`duration=${TimeSpan.toMilliseconds(duration)}ms getMany: keys=${keys.join(', ')}`)

        const rows: p.Infer<typeof parser>[] = []

        for (const row of queried) {
          if (!row) {
            continue
          }

          const json = JSON.parse(row)

          const parsed = parser.parse(json)

          if (isErr(parsed)) {
            const errorStr = JSON.stringify(parsed.error, null, 2)

            logger.error(`getMany: not a value: ${row} ${errorStr}`)

            continue
          }

          rows.push(parsed.value)
        }

        return Ok(rows)
      } catch (e) {
        logger.error(`getMany: ${keys.join(', ')} ${String(e)}`)
        return Err(String(e))
      }
    },

    async set(key, value) {
      await config.simulateLatency(SIMULATE_LATENCY)
      try {
        await redis.set(key, JSON.stringify(value))

        return Ok(null)
      } catch (e) {
        logger.error(`set: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },

    async setMany(entries) {
      await config.simulateLatency(SIMULATE_LATENCY)
      if (entries.length === 0) {
        return Ok(null)
      }

      try {
        await redis.mset(new Map(entries.map((entry) => [entry[0], JSON.stringify(entry[1])])))

        return Ok(null)
      } catch (e) {
        logger.error(`setMany: ${String(e)}`)
        return Err(String(e))
      }
    },

    async zap(key) {
      await config.simulateLatency(SIMULATE_LATENCY)
      try {
        await redis.del(key)

        return Ok(null)
      } catch (e) {
        logger.error(`zap: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },
  }
}

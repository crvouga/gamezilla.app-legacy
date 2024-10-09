import { Err, Ok, TimeSpan, isErr } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { Redis } from 'ioredis'
import type { ILogger } from '../logger/interface'
import { withDuration } from '../with-duration'
import type { IDbConnKv } from './interface'

export type Config = {
  t: 'redis'
  logger: ILogger
  redisUrl: string
}

let redis: Redis

export const DbConnKv = async (config: Config): Promise<IDbConnKv> => {
  redis ??= new Redis(config.redisUrl)

  return {
    async get(key, parser) {
      console.log('get', key)
      try {
        const [queried, duration] = await withDuration(() => redis.get(key))
        config.logger.info(`duration=${TimeSpan.toMilliseconds(duration)}ms get: key=${key}`)

        if (!queried) {
          return Ok(null)
        }

        const json = JSON.parse(queried)

        const parsed = parser.parse(json)

        switch (parsed.t) {
          case 'err': {
            const errorStr = JSON.stringify(parsed.error, null, 2)

            config.logger.error(`get: not a value: ${key} ${errorStr}`)

            return Ok(null)
          }
          case 'ok': {
            return parsed
          }
        }
      } catch (e) {
        config.logger.error(`get: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },

    async getMany(keys, parser) {
      if (keys.length <= 0) {
        return Ok([])
      }
      try {
        const [queried, duration] = await withDuration(() => redis.mget(keys))

        config.logger.info(`duration=${TimeSpan.toMilliseconds(duration)}ms get: keys=${keys.join(', ')}`)

        const rows: p.Infer<typeof parser>[] = []

        for (const row of queried) {
          if (!row) {
            continue
          }
          const json = JSON.parse(row)

          const parsed = parser.parse(json)

          if (isErr(parsed)) {
            const errorStr = JSON.stringify(parsed.error, null, 2)

            config.logger.error(`get: not a value: ${row} ${errorStr}`)

            continue
          }

          rows.push(parsed.value)
        }

        return Ok(rows)
      } catch (e) {
        config.logger.error(`get: ${keys.join(', ')} ${String(e)}`)
        return Err(String(e))
      }
    },

    async set(key, value) {
      console.log('set', key)
      try {
        await redis.set(key, JSON.stringify(value))

        return Ok(null)
      } catch (e) {
        config.logger.error(`set: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },

    async setMany(entries) {
      if (entries.length === 0) {
        return Ok(null)
      }

      try {
        await redis.mset(new Map(entries.map((entry) => [entry[0], JSON.stringify(entry[1])])))

        return Ok(null)
      } catch (e) {
        config.logger.error(`setMany: ${String(e)}`)
        return Err(String(e))
      }
    },

    async zap(key) {
      try {
        await redis.del(key)

        return Ok(null)
      } catch (e) {
        config.logger.error(`zap: ${key} ${String(e)}`)
        return Err(String(e))
      }
    }
  }
}

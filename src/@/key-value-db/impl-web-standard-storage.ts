import { Err, Ok, isErr } from '~/@/result'
import { s } from '~/@/schema'
import type { ILogger } from '../logger/interface'
import { ParseError } from '../schema/schema/parse-error'
import type { IKeyValueDb } from './interface'

const MAX_LEN = 1000

export type Config = {
  t: 'web-standard-storage'
  storage: Storage
  logger: ILogger
}

export const KeyValueDb = (config: Config): IKeyValueDb => {
  const logger = config.logger.child(['web-standard-storage'])

  return {
    async get(key, schema) {
      try {
        const value = config.storage.getItem(key)

        if (value === null) {
          return Ok(null)
        }

        const json = JSON.parse(value)

        const parsed = schema.parse(json)

        switch (parsed.t) {
          case 'err': {
            const errorStr = ParseError.toString(parsed.error)
            logger.error(`get: not a value: ${key} ${errorStr.slice(0, MAX_LEN)}`)
            return Err(errorStr)
          }
          case 'ok': {
            return parsed
          }
        }
      } catch (e) {
        const errorStr = `Caught error: get: ${String(e)}`
        logger.error(errorStr.slice(0, MAX_LEN))
        return Err(errorStr)
      }
    },

    async getMany(keys, schema) {
      if (keys.length <= 0) {
        return Ok([])
      }

      try {
        const rows: s.Infer<typeof schema>[] = []

        for (const key of keys) {
          const value = config.storage.getItem(key)

          if (!value) {
            continue
          }

          const json = JSON.parse(value)

          const parsed = schema.parse(json)

          if (isErr(parsed)) {
            const errorStr = JSON.stringify(parsed.error, null, 2)
            logger.error(`get: not a value: ${key} ${errorStr.slice(0, MAX_LEN)}`)
            return Err(errorStr)
          }

          rows.push(parsed.value)
        }

        return Ok(rows)
      } catch (e) {
        logger.error(`get: ${keys.join(', ')} ${String(e)}`)
        return Err(String(e))
      }
    },

    async set(key, value) {
      try {
        config.storage.setItem(key, JSON.stringify(value))
        return Ok(null)
      } catch (e) {
        logger.error(`set: ${key} ${String(e).slice(0, MAX_LEN)}`)
        return Err(String(e))
      }
    },

    async setMany(entries) {
      if (entries.length === 0) {
        return Ok(null)
      }

      try {
        for (const [key, value] of entries) {
          config.storage.setItem(key, JSON.stringify(value))
        }
        return Ok(null)
      } catch (e) {
        logger.error(`setMany: ${String(e).slice(0, MAX_LEN)}`)
        return Err(String(e))
      }
    },

    async zap(key) {
      try {
        config.storage.removeItem(key)
        return Ok(null)
      } catch (e) {
        logger.error(`zap: ${key} ${String(e).slice(0, MAX_LEN)}`)
        return Err(String(e))
      }
    },
  }
}

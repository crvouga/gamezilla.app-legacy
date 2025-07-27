import { Err, Ok, isErr } from '~/@/result'
import { s } from '~/@/schema'
import { IKeyValueDbSync } from '../key-value-db-sync'
import type { ILogger } from '../logger/interface'
import { ParseError } from '../schema/schema/parse-error'
import type { IKeyValueDb } from './interface'

const MAX_LEN = 1000

export type ImplKeyValueDbSync = {
  t: 'key-value-db-sync'
  keyValueDbSync: IKeyValueDbSync
  logger: ILogger
}

const init = (config: ImplKeyValueDbSync): IKeyValueDb => {
  const logger = config.logger.child(['key-value-db-sync'])

  return {
    async get(key, schema) {
      try {
        const value = config.keyValueDbSync.get(key, schema)

        if (isErr(value)) return Err(value.error)

        const maybeValue = value.value

        if (!maybeValue) return Ok(null)

        const parsed = schema.parse(maybeValue)

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
          const value = config.keyValueDbSync.get(key, schema)

          if (isErr(value)) return Err(value.error)

          const maybeValue = value.value

          if (!maybeValue) {
            continue
          }

          const parsed = schema.parse(value)

          if (isErr(parsed)) {
            const errorStr = ParseError.toString(parsed.error)
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
        config.keyValueDbSync.set(key, value)
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
          config.keyValueDbSync.set(key, value)
        }
        return Ok(null)
      } catch (e) {
        logger.error(`setMany: ${String(e).slice(0, MAX_LEN)}`)
        return Err(String(e))
      }
    },

    async zap(key) {
      try {
        config.keyValueDbSync.zap(key)
        return Ok(null)
      } catch (e) {
        logger.error(`zap: ${key} ${String(e).slice(0, MAX_LEN)}`)
        return Err(String(e))
      }
    },
  }
}

export const ImplKeyValueDbSync = {
  init,
}

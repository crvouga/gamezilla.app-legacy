import { Err, Ok } from '~/@/result'
import type { ILogger } from '../logger/interface'
import { ParseError } from '../schema/schema/parse-error'
import type { IKeyValueDbSync } from './interface'

const MAX_LEN = 1000

export type ImplWebStandardStorage = {
  t: 'web-standard-storage'
  storage: Storage
  logger: ILogger
}

const init = (config: ImplWebStandardStorage): IKeyValueDbSync => {
  const logger = config.logger.child(['web-standard-storage'])

  return {
    get(key, schema) {
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

    set(key, value) {
      try {
        config.storage.setItem(key, JSON.stringify(value))
        return Ok(null)
      } catch (e) {
        logger.error(`set: ${key} ${String(e).slice(0, MAX_LEN)}`)
        return Err(String(e))
      }
    },

    zap(key) {
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

export const ImplWebStandardStorage = {
  init,
}

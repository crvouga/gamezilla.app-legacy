import { Err, Ok } from '~/@/result'
import type { Schema } from '~/@/schema/schema'
import { ILogger } from '../logger'
import { ParseError } from '../schema/schema/parse-error'
import type { IKeyValueDbSync } from './interface'

export type KeyValueDbSyncImplHashMap = {
  t: 'hash-map'
  map?: Map<string, unknown>
  logger?: ILogger
}

const init = (config: KeyValueDbSyncImplHashMap): IKeyValueDbSync => {
  const logger = config.logger ? config.logger.child(['hash-map']) : null
  const hashMap = config?.map ?? new Map<string, unknown>()
  return {
    get<TValue>(key: string, schema: Schema<TValue>) {
      logger?.debug(`get: key=${key}`)
      if (!hashMap.has(key)) {
        return Ok(null)
      }

      const got = hashMap.get(key) ?? null

      const parsed = schema.parse(got)

      switch (parsed.t) {
        case 'err': {
          return Err(ParseError.toString(parsed.error))
        }
        case 'ok': {
          return parsed
        }
      }
    },

    set<TValue>(key: string, value: TValue) {
      logger?.debug(`set: key=${key}`)
      hashMap.set(key, value)
      return Ok(null)
    },

    zap(key: string) {
      logger?.debug(`zap: key=${key}`)
      hashMap.delete(key)
      return Ok(null)
    },
  }
}

export const KeyValueDbSyncImplHashMap = {
  init,
}

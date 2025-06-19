import { Err, Ok } from '~/@/result'
import type { s } from '~/@/schema'
import { ILogger } from '../logger'
import { ParseError } from '../schema/schema/parse-error'
import type { IKeyValueDb } from './interface'

export type Config = {
  t: 'hash-map'
  map?: Map<string, unknown>
  logger?: ILogger
}

export const KeyValueDb = (config: Config): IKeyValueDb => {
  const logger = config.logger ? config.logger.child(['hash-map']) : null
  const hashMap = config?.map ?? new Map<string, unknown>()
  return {
    async get(key, schema) {
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
          return Ok(parsed.value)
        }
      }
    },

    async getMany<TValue>(keys: string[], schema: s.Schema<TValue>) {
      logger?.debug(`getMany: keys=${keys.join(', ')}`)
      const rows: TValue[] = []

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]!
        const got = hashMap.get(key)
        if (!got) {
          continue
        }
        const parsed = schema.parse(got)
        if (parsed.t === 'ok') {
          rows.push(parsed.value)
        } else {
          return Err(ParseError.toString(parsed.error))
        }
      }

      return Ok(rows)
    },

    async set(key, value) {
      logger?.debug(`set: key=${key}`)
      hashMap.set(key, value)
      return Ok(null)
    },

    async setMany(entries) {
      logger?.debug(`setMany: keys=${entries.map((entry) => entry[0]).join(', ')}`)
      for (let i = 0; i < entries.length; i++) {
        hashMap.set(entries[i]![0], entries[i]![1])
      }
      return Ok(null)
    },

    async zap(key) {
      logger?.debug(`zap: key=${key}`)
      hashMap.delete(key)
      return Ok(null)
    },
  }
}

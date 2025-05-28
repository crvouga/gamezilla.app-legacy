import { Err, Ok } from '~/@/result'
import type { s } from '~/@/schema'
import type { IKeyValueDb } from './interface'
import { ILogger, Logger } from '../logger'

export type Config = {
  t: 'hash-map'
  map?: Map<string, unknown>
  logger?: ILogger
}

export const KeyValueDb = (config: Config): IKeyValueDb => {
  const logger = config.logger ? Logger.prefix('hash-map', config.logger) : null
  const hashMap = config?.map ?? new Map<string, unknown>()
  return {
    async get(key, parser) {
      logger?.debug(`get: key=${key}`)
      if (!hashMap.has(key)) {
        return Ok(null)
      }

      const got = hashMap.get(key) ?? null

      const parsed = parser.parse(got)

      switch (parsed.t) {
        case 'err': {
          return Err(parsed.error.map((e) => e.message).join(', '))
        }
        case 'ok': {
          return Ok(parsed.value)
        }
      }
    },

    async getMany<TValue>(keys: string[], parser: s.Parser<TValue>) {
      logger?.debug(`getMany: keys=${keys.join(', ')}`)
      const rows: TValue[] = []

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]!
        const got = hashMap.get(key)
        if (!got) {
          continue
        }
        const parsed = parser.parse(got)
        if (parsed.t === 'ok') {
          rows.push(parsed.value)
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

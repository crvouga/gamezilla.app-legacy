import { isErr } from '~/@/result'
import { s } from '~/@/schema'
import type { IKeyValueDb } from './interface'
import { ILogger, Logger } from '../logger'

export type Config = {
  t: 'with-reduced-parsing'
  keyValueDb: IKeyValueDb
  verifiedKeys: Set<string>
  logger: ILogger
}

export const withReducedParsing = ({ keyValueDb, verifiedKeys, ...config }: Config): IKeyValueDb => {
  const logger = Logger.prefix('with-reduced-parsing', config.logger)
  return {
    ...keyValueDb,

    async get<TValue>(key: string, schema: s.Parser<TValue>) {
      if (verifiedKeys.has(key)) {
        return keyValueDb.get(key, s.noop<TValue>())
      }

      const got = await keyValueDb.get(key, schema)

      if (isErr(got)) {
        return got
      }

      logger.debug(`verified key: ${key}`)

      verifiedKeys.add(key)

      return got
    },

    async getMany<TValue>(keys: string[], schema: s.Parser<TValue>) {
      const key = keys.join(',')

      if (verifiedKeys.has(key)) {
        return keyValueDb.getMany(keys, s.noop<TValue>())
      }

      const got = await keyValueDb.getMany(keys, schema)

      if (isErr(got)) {
        return got
      }

      logger.debug(`verified key: ${key}`)

      verifiedKeys.add(key)

      return got
    },
  }
}

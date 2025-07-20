import { isErr } from '~/@/result'
import { s } from '~/@/schema'
import { ILogger } from '../logger'
import type { IKeyValueDb } from './interface'

export type WithReducedParsing = {
  t: 'with-reduced-parsing'
  keyValueDb: IKeyValueDb
  verifiedKeys: Set<string>
  logger: ILogger
}

const init = ({ keyValueDb, verifiedKeys, ...config }: WithReducedParsing): IKeyValueDb => {
  const logger = config.logger.child(['with-reduced-parsing'])
  return {
    ...keyValueDb,

    async get<TValue>(key: string, schema: s.Schema<TValue>) {
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

    async getMany<TValue>(keys: string[], schema: s.Schema<TValue>) {
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

export const WithReducedParsing = {
  init,
}

import { isErr } from '~/@/core'
import { p } from '~/@/parser'
import type { IDbConnKv } from './interface'
import { ILogger, Logger } from '../logger'

export type Config = {
  t: 'with-reduced-parsing'
  dbConnKv: IDbConnKv
  verifiedKeys: Set<string>
  logger: ILogger
}

export const withReducedParsing = ({ dbConnKv, verifiedKeys, ...config }: Config): IDbConnKv => {
  const logger = Logger.prefix('with-reduced-parsing', config.logger)
  return {
    ...dbConnKv,

    async get<TValue>(key: string, parser: p.Parser<TValue>) {
      if (verifiedKeys.has(key)) {
        return dbConnKv.get(key, p.noop<TValue>())
      }

      const got = await dbConnKv.get(key, parser)

      if (isErr(got)) {
        return got
      }

      logger.debug(`verified key: ${key}`)

      verifiedKeys.add(key)

      return got
    },

    async getMany<TValue>(keys: string[], parser: p.Parser<TValue>) {
      const key = keys.join(',')

      if (verifiedKeys.has(key)) {
        return dbConnKv.getMany(keys, p.noop<TValue>())
      }

      const got = await dbConnKv.getMany(keys, parser)

      if (isErr(got)) {
        return got
      }

      logger.debug(`verified key: ${key}`)

      verifiedKeys.add(key)

      return got
    }
  }
}

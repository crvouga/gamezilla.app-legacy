import { Result } from '~/@/result'
import { ILogger, Logger } from '../logger'
import { IKeyValueDb } from './interface'

export type Config = {
  t: 'with-cache'
  cache: IKeyValueDb
  source: IKeyValueDb
  logger: ILogger
}

export const withCache = (config: Config): IKeyValueDb => {
  const logger = Logger.prefix('with-cache', config.logger)
  return {
    async get(key, parser) {
      const start = process.hrtime.bigint()

      const cacheGot = await config.cache.get(key, parser)
      const cacheHit = Result.unwrapOr(cacheGot, null)
      if (cacheHit) {
        const end = process.hrtime.bigint()
        const durationInMicroseconds = Number((end - start) / BigInt(1000))
        logger.debug(`cache hit duration=${durationInMicroseconds}µs get: key=${key}`)
        return cacheGot
      }
      logger.debug(`source hit get: key=${key}`)
      const sourceGot = await config.source.get(key, parser)
      const sourceHit = Result.unwrapOr(sourceGot, null)
      if (sourceHit) {
        await config.cache.set(key, sourceHit)
      }
      const end = process.hrtime.bigint()
      const durationInMicroseconds = Number((end - start) / BigInt(1000))
      logger.debug(`source hit duration=${durationInMicroseconds}µs get: key=${key}`)
      return sourceGot
    },
    async getMany(keys, parser) {
      const start = process.hrtime.bigint()

      const cacheGot = await config.cache.getMany(keys, parser)
      const cacheHit = Result.unwrapOr(cacheGot, null)
      if (cacheHit) {
        const end = process.hrtime.bigint()
        const durationInMicroseconds = Number((end - start) / BigInt(1000))
        const keysString = keys.join(', ')
        logger.debug(`cache hit duration=${durationInMicroseconds}µs getMany: keys=${keysString}`)
        return cacheGot
      }
      logger.debug(`source hit getMany: keys=${keys.join(', ')}`)
      const sourceGot = await config.source.getMany(keys, parser)
      const sourceHit = Result.unwrapOr(sourceGot, [])
      if (sourceHit.length > 0) {
        await config.cache.setMany(sourceHit.map((value, i) => [keys[i], value] as [string, unknown]))
      }
      const end = process.hrtime.bigint()
      const durationInMicroseconds = Number((end - start) / BigInt(1000))
      const keyString = keys.join(', ')
      logger.debug(`source hit duration=${durationInMicroseconds}µs getMany: keys=${keyString}`)
      return sourceGot
    },
    async set(key, value) {
      await config.source.set(key, value)
      return config.cache.set(key, value)
    },
    async setMany(entries) {
      await config.source.setMany(entries)
      return config.cache.setMany(entries)
    },
    async zap(key) {
      await config.source.zap(key)
      return config.cache.zap(key)
    },
  }
}

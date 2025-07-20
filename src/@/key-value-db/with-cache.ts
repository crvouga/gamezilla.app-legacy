import { Result } from '~/@/result'
import { ILogger } from '../logger'
import { IKeyValueDb } from './interface'

export type WithCache = {
  t: 'with-cache'
  cache: IKeyValueDb
  source: IKeyValueDb
  logger: ILogger
}

const init = (config: WithCache): IKeyValueDb => {
  const logger = config.logger.child(['with-cache'])
  return {
    async get(key, schema) {
      const start = process.hrtime.bigint()

      const cacheGot = await config.cache.get(key, schema)
      const cacheHit = Result.unwrapOr(cacheGot, null)
      if (cacheHit) {
        const end = process.hrtime.bigint()
        const durationInMicroseconds = Number((end - start) / BigInt(1000))
        logger.debug(`cache hit duration=${durationInMicroseconds}µs get: key=${key}`)
        return cacheGot
      }
      logger.debug(`source hit get: key=${key}`)
      const sourceGot = await config.source.get(key, schema)
      const sourceHit = Result.unwrapOr(sourceGot, null)
      if (sourceHit) {
        await config.cache.set(key, sourceHit)
      }
      const end = process.hrtime.bigint()
      const durationInMicroseconds = Number((end - start) / BigInt(1000))
      logger.debug(`source hit duration=${durationInMicroseconds}µs get: key=${key}`)
      return sourceGot
    },
    async getMany(keys, schema) {
      const start = process.hrtime.bigint()

      const cacheGot = await config.cache.getMany(keys, schema)
      const cacheHit = Result.unwrapOr(cacheGot, null)
      if (cacheHit) {
        const end = process.hrtime.bigint()
        const durationInMicroseconds = Number((end - start) / BigInt(1000))
        const keysString = keys.join(', ')
        logger.debug(`cache hit duration=${durationInMicroseconds}µs getMany: keys=${keysString}`)
        return cacheGot
      }
      logger.debug(`source hit getMany: keys=${keys.join(', ')}`)
      const sourceGot = await config.source.getMany(keys, schema)
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

export const WithCache = {
  init,
}

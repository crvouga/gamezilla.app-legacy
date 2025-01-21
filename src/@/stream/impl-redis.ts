import { Err, Ok, Result } from '~/@/result'
import { ILogger, Logger } from '../logger'
import { IRedis, newRedis } from '../redis'
import { SecretString } from '../secrets/secret-string'
import { IStream } from './interface'

export type Config<T> = {
  t: 'redis'
  redisUrl: SecretString
  encode: (value: T) => Result<string, string>
  decode: (value: string) => Result<string, T>
  logger: ILogger
}

let redis: IRedis

export const Stream = async <T>(config: Config<T>): Promise<IStream<T>> => {
  const logger = Logger.prefix('redis', config.logger)
  redis ??= await newRedis(config.redisUrl)

  return {
    async append(streamId, eventId, event) {
      logger.debug(`append: streamId=${streamId} eventId=${eventId}`)

      try {
        const encoded = config.encode(event)
        switch (encoded.t) {
          case 'ok': {
            await redis.xadd(streamId, eventId, 'data', encoded.value)
            return Ok(null)
          }
          case 'err': {
            logger.error(`Failed to encode event: ${encoded.error}`)
            return Err('Failed to encode event')
          }
        }
      } catch (error) {
        return Err(`Failed to append to stream: ${error}`)
      }
    },

    async startingFrom(streamId, fromId) {
      logger.debug(`startingFrom: streamId=${streamId} fromId=${fromId}`)

      try {
        const rawEvents = await redis.xrange(streamId, fromId ?? '0', '+')

        const events = rawEvents.flatMap(([_id, data]) => {
          const encoded = data[1] ?? ''

          const decoded = config.decode(encoded)

          switch (decoded.t) {
            case 'ok': {
              return [decoded.value]
            }
            case 'err': {
              logger.error(`Failed to decode event: ${decoded.error}`)
              return []
            }
          }
        })

        return Ok(events)
      } catch (error) {
        return Err(`Failed to read from stream: ${error}`)
      }
    },

    async has(streamId, eventId) {
      logger.debug(`has: streamId=${streamId} eventId=${eventId}`)

      try {
        const exists = await redis.exists(streamId, eventId)
        return Ok(exists === 1)
      } catch (error) {
        return Err(`Failed to check if event exists: ${error}`)
      }
    },
  }
}

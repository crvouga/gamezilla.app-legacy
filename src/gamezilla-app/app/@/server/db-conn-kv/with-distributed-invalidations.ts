import { Uuid } from 'gamezilla-app/@/core'
import { Logger, type ILogger } from '../logger'
import { IPubSubTopicBased } from '../pub-sub-topic-based'
import { IDbConnKv } from './interface'

const DistributedUpdateType = {
  SET: 0,
  SET_MANY: 1,
  ZAP: 2
} as const

export type DistributedUpdate =
  | {
      t: typeof DistributedUpdateType.SET
      k: string
    }
  | {
      t: typeof DistributedUpdateType.ZAP
      k: string
    }
  | {
      t: typeof DistributedUpdateType.SET_MANY
      k: string[]
    }

const encode = (update: DistributedUpdate): string => {
  return JSON.stringify(update)
}

const decode = (str: string): DistributedUpdate => {
  return JSON.parse(str)
}

export type Config = {
  t: 'with-distributed-invalidations'
  logger: ILogger
  cache: IDbConnKv
  pubSub: IPubSubTopicBased
}

export const withDistributedInvalidations = async (
  config: Config
): Promise<IDbConnKv & { unsubscribe: () => void }> => {
  const logger = Logger.prefix('with-distributed-invalidations', config.logger)
  const instanceId = Uuid.generate()

  const unsubscribe = await config.pubSub.sub(instanceId, (encoded) => {
    const update = decode(encoded)
    switch (update.t) {
      case DistributedUpdateType.SET: {
        logger.info(`invalidated key from SET: ${update.k}`)
        config.cache.zap(update.k)
        return
      }
      case DistributedUpdateType.SET_MANY: {
        logger.info(`invalidated keys from SET_MANY: ${update.k.join(',')}`)
        for (const k of update.k) {
          config.cache.zap(k)
        }
        return
      }
      case DistributedUpdateType.ZAP: {
        logger.info(`invalidated key from ZAP: ${update.k}`)
        config.cache.zap(update.k)
        return
      }
      default: {
        logger.error(`unknown update type: ${update}`)
        const _exhaustiveCheck: never = update
        return _exhaustiveCheck
      }
    }
  })
  return {
    unsubscribe,
    get(key, parser) {
      return config.cache.get(key, parser)
    },
    getMany(keys, parser) {
      return config.cache.getMany(keys, parser)
    },
    set(key, value) {
      config.pubSub.pub(instanceId, encode({ t: DistributedUpdateType.SET, k: key }))
      return config.cache.set(key, value)
    },
    setMany(entries) {
      config.pubSub.pub(instanceId, encode({ t: DistributedUpdateType.SET_MANY, k: entries.map((e) => e[0]) }))
      return config.cache.setMany(entries)
    },
    zap(key) {
      config.pubSub.pub(instanceId, encode({ t: DistributedUpdateType.ZAP, k: key }))
      return config.cache.zap(key)
    }
  }
}

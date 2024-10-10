import { Logger, type ILogger } from '../logger'
import { IPubSub } from '../pub-sub'
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
  logger: ILogger
  cache: IDbConnKv
  pubSub: IPubSub
}

export const withDistributedInvalidations = async (
  config: Config
): Promise<IDbConnKv & { unsubscribe: () => void }> => {
  const logger = Logger.prefix('with-distributed-invalidations', config.logger)

  const unsubscribe = await config.pubSub.sub((encoded) => {
    const update = decode(encoded)
    switch (update.t) {
      case DistributedUpdateType.SET: {
        logger.info(`invalidated key from SET: ${update.k}`)
        config.cache.zap(update.k)
        break
      }
      case DistributedUpdateType.SET_MANY: {
        logger.info(`invalidated keys from SET_MANY: ${update.k.join(',')}`)
        for (const k of update.k) {
          config.cache.zap(k)
        }
        break
      }
      case DistributedUpdateType.ZAP: {
        logger.info(`invalidated key from ZAP: ${update.k}`)
        config.cache.zap(update.k)
        break
      }
    }
  })
  return {
    ...config.cache,
    unsubscribe,
    set(key, value) {
      config.pubSub.pub(encode({ t: DistributedUpdateType.SET, k: key }))
      return config.cache.set(key, value)
    },
    setMany(entries) {
      config.pubSub.pub(encode({ t: DistributedUpdateType.SET_MANY, k: entries.map((e) => e[0]) }))
      return config.cache.setMany(entries)
    },
    zap(key) {
      config.pubSub.pub(encode({ t: DistributedUpdateType.ZAP, k: key }))
      return config.cache.zap(key)
    }
  }
}

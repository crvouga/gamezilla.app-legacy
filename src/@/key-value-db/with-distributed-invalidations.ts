import { type ILogger } from '../logger'
import { IPubSub } from '../pub-sub'
import { IKeyValueDb } from './interface'

const DistributedUpdateType = {
  SET: 0,
  SET_MANY: 1,
  ZAP: 2,
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
  cache: IKeyValueDb
  pubSub: IPubSub
}

export const withDistributedInvalidations = (config: Config): IKeyValueDb & { unsubscribe: () => void } => {
  const logger = config.logger.child(['with-distributed-invalidations'])

  const unsubscribePromise = config.pubSub.sub(async (encoded) => {
    const update = decode(encoded)
    switch (update.t) {
      case DistributedUpdateType.SET: {
        logger.info(`invalidated key from SET: ${update.k}`)
        await config.cache.zap(update.k)
        return
      }
      case DistributedUpdateType.SET_MANY: {
        logger.info(`invalidated keys from SET_MANY: ${update.k.join(',')}`)
        await Promise.all(update.k.map((k) => config.cache.zap(k)))
        return
      }
      case DistributedUpdateType.ZAP: {
        logger.info(`invalidated key from ZAP: ${update.k}`)
        await config.cache.zap(update.k)
        return
      }
      default: {
        logger.error(`unknown update type: ${update}`)
        const _exhaustiveCheck: never = update
        return _exhaustiveCheck
      }
    }
  })
  const unsubscribe = () => {
    unsubscribePromise.then((unsubscribe) => unsubscribe())
  }
  return {
    unsubscribe,
    get(key, schema) {
      return config.cache.get(key, schema)
    },
    getMany(keys, schema) {
      return config.cache.getMany(keys, schema)
    },
    async set(key, value) {
      await config.pubSub.pub(
        encode({
          t: DistributedUpdateType.SET,
          k: key,
        }),
      )
      return config.cache.set(key, value)
    },
    async setMany(entries) {
      await config.pubSub.pub(
        encode({
          t: DistributedUpdateType.SET_MANY,
          k: entries.map((e) => e[0]),
        }),
      )
      return config.cache.setMany(entries)
    },
    async zap(key) {
      await config.pubSub.pub(
        encode({
          t: DistributedUpdateType.ZAP,
          k: key,
        }),
      )
      return config.cache.zap(key)
    },
  }
}

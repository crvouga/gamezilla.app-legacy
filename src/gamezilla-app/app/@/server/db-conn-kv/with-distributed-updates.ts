import { type PubSub } from 'gamezilla-app/@/core'
import type { ILogger } from '../logger/interface'
import { IDbConnKv } from './interface'
import { Logger } from '../logger'

const DistributedUpdateType = {
  SET: 0,
  SET_MANY: 1,
  ZAP: 2
} as const

export type DistributedUpdate =
  | {
      t: typeof DistributedUpdateType.SET
      k: string
      v: unknown
    }
  | {
      t: typeof DistributedUpdateType.ZAP
      k: string
    }
  | {
      t: typeof DistributedUpdateType.SET_MANY
      e: [string, unknown][]
    }

export type Config = {
  t: 'with-distributed-updates'
  logger: ILogger
  dbConnKv: IDbConnKv
  pubSub: PubSub<DistributedUpdate>
}

export const withDistributedUpdates = (config: Config): IDbConnKv & { unsubscribe: () => void } => {
  const logger = Logger.prefix('with-distributed-updates', config.logger)
  const unsubscribe = config.pubSub.sub((update) => {
    switch (update.t) {
      case DistributedUpdateType.SET: {
        logger.info(`distributed set: key=${update.k}`)
        config.dbConnKv.set(update.k, update.v)
        break
      }
      case DistributedUpdateType.SET_MANY: {
        let key = ''
        for (let i = 0; i < update.e.length; i++) {
          key = `${key},${update.e[i]?.[0]}`
        }
        logger.info(`distributed setMany: keys=${key}`)
        config.dbConnKv.setMany(update.e)
        break
      }
      case DistributedUpdateType.ZAP: {
        logger.info(`distributed zap: key=${update.k}`)
        config.dbConnKv.zap(update.k)
        break
      }
    }
  })
  return {
    ...config.dbConnKv,
    unsubscribe,
    set(key, value) {
      config.pubSub.pub({
        t: DistributedUpdateType.SET,
        k: key,
        v: value
      })
      return config.dbConnKv.set(key, value)
    },
    setMany(entries) {
      config.pubSub.pub({
        t: DistributedUpdateType.SET_MANY,
        e: entries
      })
      return config.dbConnKv.setMany(entries)
    },
    zap(key) {
      config.pubSub.pub({
        t: DistributedUpdateType.ZAP,
        k: key
      })
      return config.dbConnKv.zap(key)
    }
  }
}

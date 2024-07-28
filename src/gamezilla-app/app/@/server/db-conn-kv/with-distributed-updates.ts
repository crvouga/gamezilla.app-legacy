import { type PubSub } from 'gamezilla-app/@/core'
import type { ILogger } from '../logger/logger'
import { IDbConnKv } from './db-conn-kv'

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

export const withDistributedUpdates = ({
  dbConnKv,
  pubSub,
  logger
}: {
  logger: ILogger
  dbConnKv: IDbConnKv
  pubSub: PubSub<DistributedUpdate>
}): IDbConnKv & { unsubscribe: () => void } => {
  const unsubscribe = pubSub.sub((update) => {
    switch (update.t) {
      case DistributedUpdateType.SET: {
        logger.info(`distributed set: key=${update.k}`)
        dbConnKv.set(update.k, update.v)
        break
      }
      case DistributedUpdateType.SET_MANY: {
        let key = ''
        for (let i = 0; i < update.e.length; i++) {
          key = `${key},${update.e[i]?.[0]}`
        }
        logger.info(`distributed setMany: keys=${key}`)
        dbConnKv.setMany(update.e)
        break
      }
      case DistributedUpdateType.ZAP: {
        logger.info(`distributed zap: key=${update.k}`)
        dbConnKv.zap(update.k)
        break
      }
    }
  })
  return {
    ...dbConnKv,
    unsubscribe,
    set(key, value) {
      pubSub.pub({
        t: DistributedUpdateType.SET,
        k: key,
        v: value
      })
      return dbConnKv.set(key, value)
    },
    setMany(entries) {
      pubSub.pub({
        t: DistributedUpdateType.SET_MANY,
        e: entries
      })
      return dbConnKv.setMany(entries)
    },
    zap(key) {
      pubSub.pub({
        t: DistributedUpdateType.ZAP,
        k: key
      })
      return dbConnKv.zap(key)
    }
  }
}

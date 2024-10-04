import { type PubSub } from 'gamezilla-app/@/core'
import type { ILogger } from '../logger/interface'
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

export type Config = {
  logger: ILogger
  dbConnKv: IDbConnKv
  pubSub: PubSub<DistributedUpdate>
}

export const withDistributedInvalidations = ({
  dbConnKv,
  pubSub,
  logger
}: Config): IDbConnKv & { unsubscribe: () => void } => {
  const unsubscribe = pubSub.sub((update) => {
    switch (update.t) {
      case DistributedUpdateType.SET: {
        logger.info(`distributed invalidation set: key=${update.k}`)
        dbConnKv.zap(update.k)
        break
      }
      case DistributedUpdateType.SET_MANY: {
        logger.info(`distributed invalidation setMany: keys=${update.k.join(',')}`)
        for (const k of update.k) {
          dbConnKv.zap(k)
        }
        break
      }
      case DistributedUpdateType.ZAP: {
        logger.info(`distributed invalidation zap: key=${update.k}`)
        dbConnKv.zap(update.k)
        break
      }
    }
  })
  return {
    ...dbConnKv,
    unsubscribe,
    set(key, value) {
      pubSub.pub({ t: DistributedUpdateType.SET, k: key })
      return dbConnKv.set(key, value)
    },
    setMany(entries) {
      pubSub.pub({ t: DistributedUpdateType.SET_MANY, k: entries.map((e) => e[0]) })
      return dbConnKv.setMany(entries)
    },
    zap(key) {
      pubSub.pub({ t: DistributedUpdateType.ZAP, k: key })
      return dbConnKv.zap(key)
    }
  }
}

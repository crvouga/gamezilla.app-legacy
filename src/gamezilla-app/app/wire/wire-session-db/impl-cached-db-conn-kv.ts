import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import { DbConnKv, IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { ILogger, Logger } from 'gamezilla-app/app/@/server/logger'
import { PubSub } from 'gamezilla-app/app/@/server/pub-sub'
import { IPubSubTopicBased } from 'gamezilla-app/app/@/server/pub-sub-topic-based'
import * as ImplDbConnKv from './impl-db-conn-kv'
import type { IWireSessionDb } from './interface'

export type Config = {
  t: 'cached-db-conn-kv'
  dbConnKv: IDbConnKv
  logger: ILogger
  pubSubTopicBased: IPubSubTopicBased
}

export const WireSessionDb = async (config: Config): Promise<IWireSessionDb> => {
  const logger = Logger.prefix('impl-cached-db-conn-kv', config.logger)

  const cache = await DbConnKv({
    t: 'with-distributed-invalidations',
    logger,
    pubSub: await PubSub({
      t: 'pub-sub-topic-based',
      pubSubTopicBased: config.pubSubTopicBased,
      topic: 'wire-session-db-cache-invalidation'
    }),
    cache: await DbConnKv({
      t: 'hash-map',
      map: LRUCache({
        maxCapacity: 2000
      })
    })
  })

  const dbConnKv = await DbConnKv({
    t: 'with-reduced-parsing',
    dbConnKv: await DbConnKv({
      t: 'with-cache',
      logger,
      source: config.dbConnKv,
      cache
    }),
    verifiedKeys: new Set(),
    logger
  })

  return ImplDbConnKv.WireSessionDb({ t: 'db-conn-kv', dbConnKv, logger })
}

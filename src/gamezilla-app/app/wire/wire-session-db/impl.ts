import { pipe } from 'gamezilla-app/@/core'
import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import { DbConnKv, IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { ILogger, Logger } from 'gamezilla-app/app/@/server/logger'
import { IPubSubTopicBased } from 'gamezilla-app/app/@/server/pub-sub-topic-based'
import * as ImplDbConnKv from './impl-db-conn-kv'
import type { IWireSessionDb } from './interface'
import { PubSub } from 'gamezilla-app/app/@/server/pub-sub'

type Config =
  | ImplDbConnKv.Config
  | { t: 'hash-map'; logger: ILogger }
  | {
      t: 'db-conn-kv-with-cache'
      dbConnKv: IDbConnKv
      logger: ILogger
      pubSubTopicBased: IPubSubTopicBased
    }

export const WireSessionDb = async (config: Config): Promise<IWireSessionDb> => {
  const logger = Logger.prefix('wire-session-db', config.logger)
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.WireSessionDb(config)
    }

    case 'hash-map': {
      return ImplDbConnKv.WireSessionDb({
        t: 'db-conn-kv',
        dbConnKv: await DbConnKv({ t: 'hash-map' }),
        logger
      })
    }

    case 'db-conn-kv-with-cache': {
      const dbConnKv = await pipe(
        config.dbConnKv,

        async (dbConnKv) =>
          DbConnKv({
            t: 'with-cache',
            logger,
            source: dbConnKv,
            cache: await DbConnKv({
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
          }),
        async (dbConnKv) =>
          DbConnKv({
            t: 'with-reduced-parsing',
            dbConnKv: await dbConnKv,
            verifiedKeys: new Set(),
            logger
          })
      )

      return ImplDbConnKv.WireSessionDb({ t: 'db-conn-kv', dbConnKv, logger })
    }
  }
}

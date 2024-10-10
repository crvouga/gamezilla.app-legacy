import { pipe } from 'gamezilla-app/@/core'
import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import { DbConnKv, IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { ILogger, Logger } from 'gamezilla-app/app/@/server/logger'
import { PubSub } from 'gamezilla-app/app/@/server/pub-sub'
import * as ImplDbConnKv from './impl-db-conn-kv'
import type { IWireSessionDb } from './interface'

type Config =
  | ImplDbConnKv.Config
  | { t: 'hash-map'; logger: ILogger }
  | { t: 'db-conn-kv-with-fast-cache'; dbConnKv: IDbConnKv; logger: ILogger }

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

    case 'db-conn-kv-with-fast-cache': {
      const dbConnKv = await pipe(
        config.dbConnKv,

        async (dbConnKv) =>
          true
            ? DbConnKv.withCache({
                logger,
                source: dbConnKv,
                cache: await DbConnKv.withDistributedInvalidations({
                  logger,
                  pubSub: await PubSub({ t: 'in-memory' }),
                  cache: await DbConnKv({ t: 'hash-map', map: LRUCache({ maxCapacity: 2000 }) })
                })
              })
            : dbConnKv,

        async (dbConnKv) =>
          DbConnKv.withReducedParsing({
            dbConnKv: await dbConnKv,
            verifiedKeys: new Set(),
            logger
          })
      )

      return ImplDbConnKv.WireSessionDb({ t: 'db-conn-kv', dbConnKv, logger })
    }
  }
}

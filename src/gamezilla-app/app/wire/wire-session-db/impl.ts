import { pipe } from 'gamezilla-app/@/core'
import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import { DbConnKv, IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { Logger } from 'gamezilla-app/app/@/server/logger'
import { PubSub } from 'gamezilla-app/app/@/server/pub-sub'
import * as ImplDbConnKv from './impl-db-conn-kv'
import type { IWireSessionDb } from './interface'

type Config = ImplDbConnKv.Config | { t: 'hash-map' } | { t: 'db-conn-kv-with-fast-cache'; dbConnKv: IDbConnKv }

export const WireSessionDb = async (config: Config): Promise<IWireSessionDb> => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.WireSessionDb(config)
    }

    case 'hash-map': {
      return ImplDbConnKv.WireSessionDb({
        t: 'db-conn-kv',
        dbConnKv: await DbConnKv({ t: 'hash-map' })
      })
    }

    case 'db-conn-kv-with-fast-cache': {
      const dbConnKv = await pipe(
        config.dbConnKv,

        async (dbConnKv) =>
          DbConnKv.withCache({
            logger: Logger({ t: 'noop' }),
            source: dbConnKv,
            cache: DbConnKv.withDistributedInvalidations({
              logger: Logger({ t: 'noop' }),
              pubSub: PubSub({ t: 'in-memory' }),
              dbConnKv: await DbConnKv({ t: 'hash-map', map: LRUCache({ maxCapacity: 2000 }) })
            })
          }),

        async (dbConnKv) =>
          DbConnKv.withReducedParsing({
            dbConnKv: await dbConnKv,
            verifiedKeys: new Set()
          })
      )

      return ImplDbConnKv.WireSessionDb({
        t: 'db-conn-kv',
        dbConnKv
      })
    }
  }
}

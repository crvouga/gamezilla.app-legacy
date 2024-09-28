import type { IDbConnSql } from '../db-conn-sql'
import type { ILogger } from '../logger/logger'
import type { IDbConnKv } from './db-conn-kv'
import * as HashMap from './db-conn-kv-impl-hash-map'
import * as DbConnSql from './db-conn-kv-impl-db-conn-sql'
import * as Redis from './db-conn-kv-impl-redis'
import { withCache } from './with-cache'
import { withDistributedUpdates } from './with-distributed-updates'
import { withNamespace } from './with-namespace'
import { withReducedParsing } from './with-reduced-parsing'
import { withThrottledWrites } from './with-throttled-writes'

export type Impl =
  | {
      t: 'hash-map'
      map?: Map<string, unknown>
    }
  | {
      t: 'redis'
      url: string
      logger: ILogger
    }
  | {
      t: 'db-conn-sql'
      dbConnSql: IDbConnSql
      logger: ILogger
    }

export const DbConnKv = async (impl: Impl): Promise<IDbConnKv> => {
  switch (impl.t) {
    case 'hash-map': {
      return HashMap.DbConnKv({
        map: impl.map
      })
    }

    case 'redis': {
      return Redis.DbConnKv({
        url: impl.url,
        logger: impl.logger
      })
    }

    case 'db-conn-sql': {
      return DbConnSql.DbConnKv({
        dbConn: impl.dbConnSql,
        logger: impl.logger
      })
    }
  }
}

DbConnKv.withCache = withCache
DbConnKv.withReducedParsing = withReducedParsing
DbConnKv.withThrottledWrites = withThrottledWrites
DbConnKv.withDistributedUpdates = withDistributedUpdates
DbConnKv.withNamespace = withNamespace

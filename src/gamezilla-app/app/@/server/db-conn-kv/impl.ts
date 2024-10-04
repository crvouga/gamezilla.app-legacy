import * as DbConnSql from './impl-db-conn-sql'
import * as HashMap from './impl-hash-map'
import type { IDbConnKv } from './interface'
import * as WithCache from './with-cache'
import * as WithDistributedUpdates from './with-distributed-updates'
import * as WithNamespace from './with-namespace'
import * as WithReducedParsing from './with-reduced-parsing'
import * as WithThrottledWrites from './with-throttled-writes'

export type Config =
  | HashMap.Config
  | DbConnSql.Config
  | (WithCache.Config & { t: 'with-cache' })
  | (WithDistributedUpdates.Config & { t: 'with-distributed-updates' })
  | (WithReducedParsing.Config & { t: 'with-reduced-parsing' })
  | (WithThrottledWrites.Config & { t: 'with-throttled-writes' })

export const DbConnKv = async (config: Config): Promise<IDbConnKv> => {
  switch (config.t) {
    case 'hash-map': {
      return HashMap.DbConnKv(config)
    }

    case 'db-conn-sql': {
      return DbConnSql.DbConnKv(config)
    }

    case 'with-cache': {
      return WithCache.withCache(config)
    }

    case 'with-distributed-updates': {
      return WithDistributedUpdates.withDistributedUpdates(config)
    }

    case 'with-reduced-parsing': {
      return WithReducedParsing.withReducedParsing(config)
    }

    case 'with-throttled-writes': {
      return WithThrottledWrites.withThrottledWrites(config)
    }
  }
}

DbConnKv.withCache = WithCache.withCache
DbConnKv.withReducedParsing = WithReducedParsing.withReducedParsing
DbConnKv.withThrottledWrites = WithThrottledWrites.withThrottledWrites
DbConnKv.withDistributedUpdates = WithDistributedUpdates.withDistributedUpdates
DbConnKv.withNamespace = WithNamespace.withNamespace

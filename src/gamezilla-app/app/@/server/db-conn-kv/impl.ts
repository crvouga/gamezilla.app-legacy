import * as DbConnSql from './impl-postgres'
import * as HashMap from './impl-hash-map'
import type { IDbConnKv } from './interface'
import * as WithCache from './with-cache'
import * as WithDistributedInvalidations from './with-distributed-invalidations'
import * as WithDistributedUpdates from './with-distributed-updates'
import * as WithNamespace from './with-namespace'
import * as WithReducedParsing from './with-reduced-parsing'
import * as WithThrottledWrites from './with-throttled-writes'
import * as ImplRedis from './impl-redis'
import * as ImplInMemory from './impl-in-memory'

export type Config =
  | HashMap.Config
  | DbConnSql.Config
  | ImplRedis.Config
  | ImplInMemory.Config
  | WithCache.Config
  | WithDistributedUpdates.Config
  | WithReducedParsing.Config
  | WithThrottledWrites.Config
  | WithDistributedInvalidations.Config

export const DbConnKv = async (config: Config): Promise<IDbConnKv> => {
  switch (config.t) {
    case 'hash-map': {
      return HashMap.DbConnKv(config)
    }

    case 'redis': {
      return ImplRedis.DbConnKv(config)
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

    case 'with-distributed-invalidations': {
      return WithDistributedInvalidations.withDistributedInvalidations(config)
    }

    case 'in-memory': {
      return ImplInMemory.DbConnKv(config)
    }
  }
}

DbConnKv.withNamespace = WithNamespace.withNamespace

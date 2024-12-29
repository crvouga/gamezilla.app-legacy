import { Logger } from '../logger'
import * as ImplHashMap from './impl-hash-map'
import * as ImplInMemory from './impl-in-memory'
import * as ImplPostgres from './impl-postgres'
import * as ImplRedis from './impl-redis'
import type { IDbConnKv } from './interface'
import * as WithCache from './with-cache'
import * as WithDistributedInvalidations from './with-distributed-invalidations'
import * as WithDistributedUpdates from './with-distributed-updates'
import * as WithNamespace from './with-namespace'
import * as WithReducedParsing from './with-reduced-parsing'
import * as WithThrottledWrites from './with-throttled-writes'

export type Config =
  | ImplHashMap.Config
  | ImplPostgres.Config
  | ImplRedis.Config
  | ImplInMemory.Config
  | WithCache.Config
  | WithDistributedUpdates.Config
  | WithReducedParsing.Config
  | WithThrottledWrites.Config
  | WithDistributedInvalidations.Config

export const DbConnKv = async (configInput: Config): Promise<IDbConnKv> => {
  const logger = Logger.prefix('db-conn-kv', configInput.logger ?? Logger({ t: 'noop' }))
  const config: Config = { ...configInput, logger }
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.DbConnKv(config)
    }

    case 'redis': {
      return ImplRedis.DbConnKv(config)
    }

    case 'postgres': {
      return ImplPostgres.DbConnKv(config)
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

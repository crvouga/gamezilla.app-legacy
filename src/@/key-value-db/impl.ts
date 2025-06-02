import { Logger } from '../logger'
import * as ImplHashMap from './impl-hash-map'
import * as ImplInMemory from './impl-in-memory'
import * as ImplSqlDb from './impl-db-conn-sql'
import * as ImplRedis from './impl-redis'
import type { IKeyValueDb } from './interface'
import * as WithCache from './with-cache'
import * as WithDistributedInvalidations from './with-distributed-invalidations'
import * as WithDistributedUpdates from './with-distributed-updates'
import * as WithNamespace from './with-namespace'
import * as WithReducedParsing from './with-reduced-parsing'
import * as WithThrottledWrites from './with-throttled-writes'
import * as WithSqlTables from './with-sql-tables'

export type Config =
  | ImplHashMap.Config
  | ImplSqlDb.Config
  | ImplRedis.Config
  | ImplInMemory.Config
  | WithCache.Config
  | WithDistributedUpdates.Config
  | WithReducedParsing.Config
  | WithThrottledWrites.Config
  | WithDistributedInvalidations.Config
  | WithSqlTables.Config

export const KeyValueDb = async (configInput: Config): Promise<IKeyValueDb> => {
  const logger = Logger.prefix('key-value-db', configInput.logger ?? Logger({ t: 'noop' }))
  const config: Config = { ...configInput, logger }
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.KeyValueDb(config)
    }

    case 'redis': {
      return ImplRedis.KeyValueDb(config)
    }

    case 'db-conn-sql': {
      return ImplSqlDb.KeyValueDb(config)
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
      return ImplInMemory.KeyValueDb(config)
    }

    case 'with-sql-tables': {
      return WithSqlTables.KeyValueDb(config)
    }
  }
}

KeyValueDb.withNamespace = WithNamespace.withNamespace

import { Logger } from '../logger'
import * as ImplHashMap from './impl-hash-map'
import * as ImplInMemory from './impl-in-memory'
import * as ImplSqlDb from './impl-sql-db'
import type { IKeyValueDb } from './interface'
import * as WithCache from './with-cache'
import * as WithDistributedInvalidations from './with-distributed-invalidations'
import * as WithDistributedUpdates from './with-distributed-updates'
import * as WithNamespace from './with-namespace'
import * as WithReducedParsing from './with-reduced-parsing'
import * as WithSqlTables from './with-sql-tables'
import * as WithThrottledWrites from './with-throttled-writes'

export type Config =
  | ImplHashMap.Config
  | ImplSqlDb.Config
  | ImplInMemory.Config
  | WithCache.Config
  | WithDistributedUpdates.Config
  | WithReducedParsing.Config
  | WithThrottledWrites.Config
  | WithDistributedInvalidations.Config
  | WithSqlTables.Config

export const KeyValueDb = async (configInput: Config): Promise<IKeyValueDb> => {
  const logger = configInput.logger?.child(['key-value-db']) ?? Logger({ t: 'noop' })
  const config: Config = { ...configInput, logger }
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.KeyValueDb(config)
    }

    case 'sql-db': {
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

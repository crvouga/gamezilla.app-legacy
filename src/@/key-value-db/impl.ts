import { Logger } from '../logger'
import { ImplHashMap } from './impl-hash-map'
import { ImplInMemory } from './impl-in-memory'
import { ImplKeyValueDbSync } from './impl-key-value-db-sync'
import { ImplSqlDb } from './impl-sql-db'
import { ImplWebStandardStorage } from './impl-web-standard-storage'
import type { IKeyValueDb } from './interface'
import { WithCache } from './with-cache'
import { WithDistributedInvalidations } from './with-distributed-invalidations'
import { WithDistributedUpdates } from './with-distributed-updates'
import { WithNamespace } from './with-namespace'
import { WithReducedParsing } from './with-reduced-parsing'
import { WithThrottledWrites } from './with-throttled-writes'

export type Config =
  | ImplHashMap
  | ImplSqlDb
  | ImplInMemory
  | WithCache
  | WithDistributedUpdates
  | WithReducedParsing
  | WithThrottledWrites
  | WithDistributedInvalidations
  | ImplWebStandardStorage
  | ImplKeyValueDbSync

const init = (config_: Config): IKeyValueDb => {
  const logger = config_.logger?.child(['key-value-db']) ?? Logger.init({ t: 'noop' })
  const config: Config = { ...config_, logger }
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.init(config)
    }

    case 'sql-db': {
      return ImplSqlDb.init(config)
    }

    case 'with-cache': {
      return WithCache.init(config)
    }

    case 'with-distributed-updates': {
      return WithDistributedUpdates.init(config)
    }

    case 'with-reduced-parsing': {
      return WithReducedParsing.init(config)
    }

    case 'with-throttled-writes': {
      return WithThrottledWrites.init(config)
    }

    case 'with-distributed-invalidations': {
      return WithDistributedInvalidations.init(config)
    }

    case 'in-memory': {
      return ImplInMemory.init(config)
    }

    case 'web-standard-storage': {
      return ImplWebStandardStorage.init(config)
    }

    case 'key-value-db-sync': {
      return ImplKeyValueDbSync.init(config)
    }
  }
}

export const KeyValueDb = {
  init,
  withNamespace: WithNamespace,
}

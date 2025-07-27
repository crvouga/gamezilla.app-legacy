import { Logger } from '../logger'
import { KeyValueDbSyncImplHashMap } from './impl-hash-map'
import { ImplWebStandardStorage } from './impl-web-standard-storage'
import type { IKeyValueDbSync } from './interface'

export type Config = KeyValueDbSyncImplHashMap | ImplWebStandardStorage

const init = (config_: Config): IKeyValueDbSync => {
  const logger = config_.logger?.child(['key-value-db']) ?? Logger.init({ t: 'noop' })
  const config: Config = { ...config_, logger }
  switch (config.t) {
    case 'hash-map': {
      return KeyValueDbSyncImplHashMap.init(config)
    }

    case 'web-standard-storage': {
      return ImplWebStandardStorage.init(config)
    }
  }
}

export const KeyValueDbSync = {
  init,
}

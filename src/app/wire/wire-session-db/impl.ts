import { Logger } from '~/@/logger'
import * as ImplCachedKeyValueDb from './impl-cached-db-conn-kv'
import * as ImplKeyValueDb from './impl-db-conn-kv'
import type { IWireSessionDb } from './interface'

export type Config = ImplKeyValueDb.Config | ImplCachedKeyValueDb.Config

export const WireSessionDb = async (config: Config): Promise<IWireSessionDb> => {
  const logger = Logger.prefix('wire-session-db', config.logger)
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplKeyValueDb.WireSessionDb({ ...config, logger })
    }

    case 'cached-db-conn-kv': {
      return ImplCachedKeyValueDb.WireSessionDb({ ...config, logger })
    }
  }
}

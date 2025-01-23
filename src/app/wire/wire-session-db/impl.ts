import { Logger } from '~/@/logger'
import * as ImplCachedKeyValueDb from './impl-cached-key-value-db'
import * as ImplKeyValueDb from './impl-key-value-db'
import type { IWireSessionDb } from './interface'

export type Config = ImplKeyValueDb.Config | ImplCachedKeyValueDb.Config

export const WireSessionDb = async (config: Config): Promise<IWireSessionDb> => {
  const logger = Logger.prefix('wire-session-db', config.logger)
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.WireSessionDb({ ...config, logger })
    }

    case 'cached-key-value-db': {
      return ImplCachedKeyValueDb.WireSessionDb({ ...config, logger })
    }
  }
}

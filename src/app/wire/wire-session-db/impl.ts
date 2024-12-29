import { Logger } from '~/@/logger'
import * as ImplCachedDbConnKv from './impl-cached-db-conn-kv'
import * as ImplDbConnKv from './impl-db-conn-kv'
import type { IWireSessionDb } from './interface'

export type Config = ImplDbConnKv.Config | ImplCachedDbConnKv.Config

export const WireSessionDb = async (config: Config): Promise<IWireSessionDb> => {
  const logger = Logger.prefix('wire-session-db', config.logger)
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.WireSessionDb({ ...config, logger })
    }

    case 'cached-db-conn-kv': {
      return ImplCachedDbConnKv.WireSessionDb({ ...config, logger })
    }
  }
}

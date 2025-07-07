import * as ImplBackend from './impl-backend'
import * as ImplHttpClient from './impl-http-client'
import { ISyncEngine } from './interface'

export type Config = ImplBackend.Config | ImplHttpClient.Config

export const SyncEngine = (config: Config): ISyncEngine => {
  const logger = config.logger.child(['sync-engine'])

  switch (config.t) {
    case 'http-client': {
      return ImplHttpClient.SyncEngineHttpClient({ ...config, logger })
    }

    case 'backend': {
      return ImplBackend.SyncEngineBackend({ ...config, logger })
    }
  }
}

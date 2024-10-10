import * as ImplInMemory from './impl-in-memory'
import * as ImplPostgres from './impl-postgres'
import * as ImplRedis from './impl-redis'
import { IPubSubTopicBased } from './interface'

export type Config = ImplInMemory.Config | ImplPostgres.Config | ImplRedis.Config

export const PubSubTopicBased = async (config: Config): Promise<IPubSubTopicBased> => {
  switch (config.t) {
    case 'in-memory': {
      return ImplInMemory.PubSubTopicBased(config)
    }
    case 'postgres': {
      return ImplPostgres.PubSubTopicBased(config)
    }
    case 'redis': {
      return ImplRedis.PubSubTopicBased(config)
    }
  }
}

import * as ImplInMemory from './impl-in-memory'
import * as ImplPostgres from './impl-postgres'
import * as ImplRedis from './impl-redis'
import { IPubSubTopicBased } from './interface'

export type Config<T> = ImplInMemory.Config<T> | ImplPostgres.Config<T> | ImplRedis.Config<T>

export const PubSubTopicBased = async <TMsg>(config: Config<TMsg>): Promise<IPubSubTopicBased<TMsg>> => {
  switch (config.t) {
    case 'in-memory': {
      return ImplInMemory.PubSubTopicBased<TMsg>(config)
    }
    case 'postgres': {
      return ImplPostgres.PubSubTopicBased<TMsg>(config)
    }
    case 'redis': {
      return ImplRedis.PubSubTopicBased<TMsg>(config)
    }
  }
}

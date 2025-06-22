import * as ImplInMemory from './impl-in-memory'
import * as ImplNoop from './impl-noop'
import * as ImplPostgres from './impl-postgres'
import { IPubSubTopicBased } from './interface'

export type Config = ImplInMemory.Config | ImplPostgres.Config | ImplNoop.Config

export const PubSubTopicBased = async (config: Config): Promise<IPubSubTopicBased> => {
  switch (config.t) {
    case 'in-memory': {
      return ImplInMemory.PubSubTopicBased(config)
    }
    case 'postgres': {
      return ImplPostgres.PubSubTopicBased(config)
    }
    case 'noop': {
      return ImplNoop.PubSubTopicBased(config)
    }
  }
}

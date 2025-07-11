import * as ImplInMemory from './impl-in-memory'
import * as ImplNats from './impl-nats'
import * as ImplNoop from './impl-noop'
import * as ImplSqlDb from './impl-sql-db'
import { ITopicBasedPubSub } from './interface'

export type Config = ImplInMemory.Config | ImplSqlDb.Config | ImplNoop.Config | ImplNats.Config | ImplNats.Config

export const TopicBasedPubSub = (config: Config): ITopicBasedPubSub => {
  switch (config.t) {
    case 'in-memory': {
      return ImplInMemory.TopicBasedPubSub(config)
    }
    case 'sql-db': {
      return ImplSqlDb.TopicBasedPubSub(config)
    }
    case 'noop': {
      return ImplNoop.TopicBasedPubSub(config)
    }
    case 'nats': {
      return ImplNats.TopicBasedPubSub(config)
    }
  }
}

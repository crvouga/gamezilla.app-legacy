import { ImplInMemory } from './impl-in-memory'
import { ImplNats } from './impl-nats'
import { ImplNoop } from './impl-noop'
import { ImplSqlDb } from './impl-sql-db'
import { ITopicBasedPubSub } from './interface'

export type TopicBasedPubSub = ImplInMemory | ImplSqlDb | ImplNoop | ImplNats | ImplNats

const init = (config: TopicBasedPubSub): ITopicBasedPubSub => {
  switch (config.t) {
    case 'in-memory': {
      return ImplInMemory.init(config)
    }
    case 'sql-db': {
      return ImplSqlDb.init(config)
    }
    case 'noop': {
      return ImplNoop.init(config)
    }
    case 'nats': {
      return ImplNats.init(config)
    }
  }
}

export const TopicBasedPubSub = {
  init,
}

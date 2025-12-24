import { ImplInMemory } from './impl-in-memory'
import { ImplNoop } from './impl-noop'
import { ImplSqlDb } from './impl-sql-db'
import { ITopicBasedPubSub } from './interface'

export type TopicBasedPubSub = ImplInMemory | ImplSqlDb | ImplNoop

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
  }
}

export const TopicBasedPubSub = {
  init,
}

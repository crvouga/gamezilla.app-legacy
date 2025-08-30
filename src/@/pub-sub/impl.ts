import { ImplInMemory } from './impl-in-memory'
import { ImplPostgres } from './impl-postgres'
import { ImplFromTopicBasedPubSub } from './impl-pub-sub-topic-based'
import { IPubSub } from './interface'

export type Config = ImplPostgres | ImplInMemory | ImplFromTopicBasedPubSub

export const PubSub = (config: Config): IPubSub => {
  switch (config.t) {
    case 'postgres':
      return ImplPostgres.init(config)
    case 'in-memory':
      return ImplInMemory.init(config)
    case 'from-topic-based-pub-sub':
      return ImplFromTopicBasedPubSub.init(config)
  }
}

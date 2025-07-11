import * as ImplPostgres from './impl-postgres'
import * as ImplInMemory from './impl-in-memory'
import * as ImplTopicBasedPubSub from './impl-pub-sub-topic-based'
import { IPubSub } from './interface'

export type Config = ImplPostgres.Config | ImplInMemory.Config | ImplTopicBasedPubSub.Config

export const PubSub = (config: Config): IPubSub => {
  switch (config.t) {
    case 'postgres': {
      return ImplPostgres.PubSub(config)
    }
    case 'in-memory': {
      return ImplInMemory.PubSub(config)
    }
    case 'pub-sub-topic-based': {
      return ImplTopicBasedPubSub.PubSub(config)
    }
  }
}

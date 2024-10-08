import * as ImplInMemory from './impl-in-memory'
import { IPubSubTopicBased } from './interface'

export type Config<T> = ImplInMemory.Config<T>

export const PubSubTopicBased = <TMsg>(config: Config<TMsg>): IPubSubTopicBased<TMsg> => {
  switch (config.t) {
    case 'in-memory': {
      return ImplInMemory.PubSubTopicBased<TMsg>(config)
    }
  }
}

import { TopicContractBase } from '../topic-contract'
import { ImplFromServer } from './impl-from-server'
import { ImplLocal } from './impl-local'
import { ImplWebSocketsInHouse } from './impl-web-socket-in-house'
import { ITopicClient } from './interface'

export type Config<T extends TopicContractBase> = ImplLocal<T> | ImplWebSocketsInHouse<T> | ImplFromServer<T>

const init = <T extends TopicContractBase>(config: Config<T>): ITopicClient<T> => {
  switch (config.t) {
    case 'local':
      return ImplLocal.init(config)
    case 'web-sockets-in-house':
      return ImplWebSocketsInHouse.init(config)
    case 'from-server':
      return ImplFromServer.init(config)
  }
}

export const TopicClient = {
  init,
}

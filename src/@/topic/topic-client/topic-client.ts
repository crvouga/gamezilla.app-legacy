import { TopicContractBase } from '../topic-contract'
import { ITopicClient } from './types'
import { ImplFromServer } from './impl-from-server'
import { ImplLocal } from './impl-local'
import { ImplWebSockets } from './impl-web-socket'

export type Config<T extends TopicContractBase> = ImplLocal<T> | ImplWebSockets<T> | ImplFromServer<T>

const init = <T extends TopicContractBase>(config: Config<T>): ITopicClient<T> => {
  switch (config.t) {
    case 'local':
      return ImplLocal.init(config)
    case 'web-sockets':
      return ImplWebSockets.init(config)
    case 'from-server':
      return ImplFromServer.init(config)
  }
}

export const TopicClient = {
  init,
}

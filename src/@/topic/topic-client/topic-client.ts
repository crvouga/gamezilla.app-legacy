import { TopicContractBase } from '../topic-contract'
import { ITopicClient } from './types'
import { ImplForServer } from './impl-for-server'
import { ImplLocal } from './impl-local'
import { ImplWebSockets } from './impl-web-socket'

export type Config<T extends TopicContractBase> = ImplLocal<T> | ImplWebSockets<T> | ImplForServer<T>

const init = <T extends TopicContractBase>(config: Config<T>): ITopicClient<T> => {
  switch (config.t) {
    case 'local':
      return ImplLocal.init(config)
    case 'web-sockets':
      return ImplWebSockets.init(config)
    case 'for-server':
      return ImplForServer.init(config)
  }
}

export const TopicClient = {
  init,
}

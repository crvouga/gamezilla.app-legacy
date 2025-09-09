import { TopicContractBase } from '../topic-contract'
import { ImplWebSocketInHouse } from './impl-web-socket-in-house'
import { ITopicServer } from './interface'

export type TopicServer = ImplWebSocketInHouse<TopicContractBase>

const init = <TContract extends TopicContractBase>(
  config: ImplWebSocketInHouse<TContract>,
): ITopicServer<TContract> => {
  switch (config.t) {
    case 'web-sockets-in-house':
      return ImplWebSocketInHouse.init(config)
  }
}

export const TopicServer = {
  init,
}

import { Logger } from '~/@/logger'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { TopicClient } from '../../topic-client/topic-client'
import { IFixture, testTopicContract } from './interface'

export type ImplWebSocketServerNats = {
  t: 'web-socket-server-nats'
}

const init = async (_config?: ImplWebSocketServerNats): Promise<IFixture> => {
  const topicClient = TopicClient.init({
    t: 'local',
    contract: testTopicContract,
    logger: Logger.init({ t: 'noop' }),
  })
  const initClient = () => {
    return {
      clientSessionId: ClientSessionId.generate(),
      topic: topicClient,
    }
  }
  return {
    topicContract: testTopicContract,
    clientA: initClient(),
    clientB: initClient(),
    clientC: initClient(),
    isSubscribedClientA: (_topicName, _params) => true,
    isSubscribedClientB: (_topicName, _params) => true,
    isSubscribedClientC: (_topicName, _params) => true,
    restartServer: async () => {},
    [Symbol.asyncDispose]: async () => {},
  }
}

export const ImplWebSocketServerNats = {
  init,
}

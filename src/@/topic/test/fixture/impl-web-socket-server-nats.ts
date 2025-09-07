import { Logger } from '~/@/logger'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { TopicClient } from '../../topic-client/topic-client'
import { IFixture, IFixtureClient, testTopicContract } from './interface'

export type ImplWebSocketServerNats = {
  t: 'web-socket-server-nats'
}

const init = async (_config?: ImplWebSocketServerNats): Promise<IFixture> => {
  const logger = Logger.init({ t: 'noop' })
  const initClient = (childName: string): IFixtureClient => {
    const topic = TopicClient.init({
      t: 'local',
      contract: testTopicContract,
      logger: logger.child(['client', childName]),
    })
    const clientSessionId = ClientSessionId.generate()
    return {
      clientSessionId,
      topic,
    }
  }
  return {
    topicContract: testTopicContract,
    clientA: initClient('A'),
    clientB: initClient('B'),
    clientC: initClient('C'),
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

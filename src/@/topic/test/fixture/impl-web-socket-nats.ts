import { Logger } from '~/@/logger'
import { TimeSpan } from '~/@/time/time-span'
import { Url } from '~/@/url/url'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { TopicClient } from '../../topic-client/impl'
import { TopicMsgCodec } from '../../topic-msg-codec'
import { IFixture, IFixtureClient, testTopicContract } from './interface'

export type ImplWebSocketNats = {
  t: 'web-socket-nats'
}

const init = async (_config?: ImplWebSocketNats): Promise<IFixture> => {
  const logger = Logger.init({ t: 'noop' })
  const codec = TopicMsgCodec.init({ t: 'json' })
  const initClient = (childName: string): IFixtureClient => {
    const clientSessionId = ClientSessionId.generate()
    const topic = TopicClient.init({
      t: 'nats-client',
      contract: testTopicContract,
      clientSessionId,
      codec,
      logger: logger.child(['client', childName]),
      async getServerUrls() {
        return [Url.derive('http://localhost:9222', 'http')]
      },
      reconnectionRate: TimeSpan.seconds(0),
      syncSubscriptionRate: TimeSpan.seconds(0),
    })
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

export const ImplWebSocketNats = {
  init,
}

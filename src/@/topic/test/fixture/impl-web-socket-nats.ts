import { Logger } from '~/@/logger'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { TopicClient } from '../../topic-client/impl'
import { TopicMsgCodec } from '../../topic-msg-codec'
import { IFixture, IFixtureClient, testTopicContract } from './interface'
import { Url } from '~/@/url/url'
import { TimeSpan } from '~/@/time/time-span'

export type ImplWebSocketNats = {
  t: 'web-socket-nats'
}

const init = async (_config?: ImplWebSocketNats): Promise<IFixture> => {
  const logger = Logger.init({ t: 'noop' })
  const codec = TopicMsgCodec.init({ t: 'json' })
  const initClient = (childName: string): IFixtureClient => {
    const clientSessionId = ClientSessionId.generate()
    const natsServerUrl = process.env.NATS_URL
    if (!natsServerUrl) throw new Error('NATS_URL is not set')
    const topic = TopicClient.init({
      t: 'web-sockets-nats',
      contract: testTopicContract,
      clientSessionId,
      codec,
      logger: logger.child(['client', childName]),
      serverUrl: Url.derive(natsServerUrl, 'http'),
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

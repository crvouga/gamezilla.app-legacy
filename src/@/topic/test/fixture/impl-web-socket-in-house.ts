import { HttpServer } from '~/@/http-server'
import { ILogger, Logger } from '~/@/logger'
import { s } from '~/@/schema'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { TopicBasedPubSub } from '../../../pub-sub-topic-based'
import { randomServerPort } from '../../../test/random-server-port'
import { Url } from '../../../url/url'
import { TopicClient } from '../../topic-client/impl'
import { TopicMsgCodec } from '../../topic-msg-codec'

import { TopicServer } from '../../topic-server/impl'
import { IFixture, IFixtureClient, RECONNECTION_RATE, SYNC_SUBSCRIPTION_RATE, testTopicContract } from './interface'

export type ImplWebSocketInHouse = {
  t: 'web-socket-in-house'
}

const init = async (_config?: ImplWebSocketInHouse): Promise<IFixture> => {
  const port = randomServerPort()
  let logger: ILogger
  logger ??= Logger.init({ t: 'noop' })
  logger ??= Logger.init({ t: 'console', newLinePerMsg: false, namespace: ['test'], maxLogLevel: 'info' })
  const httpServer = HttpServer.init({ t: 'node', logger })

  const endpoint = '/topic'
  const serverUrl = Url.derive(`http://localhost:${port}`, 'http')

  const codec = TopicMsgCodec.init({ t: 'json' })

  const pubSub = TopicBasedPubSub.init({ t: 'in-memory' })

  const topicServer = TopicServer.init({
    t: 'web-sockets-in-house',
    httpServer,
    logger: logger.child(['server']),
    contract: testTopicContract,
    endpoint,
    codec,
    pubSub,
  })

  const initClient = (childName: string): IFixtureClient => {
    const clientSessionId = ClientSessionId.generate()
    const topic = TopicClient.init({
      t: 'web-sockets-in-house',
      clientSessionId,
      contract: testTopicContract,
      serverUrl,
      endpoint,
      logger: logger.child(['client', childName]),
      reconnectionRate: RECONNECTION_RATE,
      syncSubscriptionRate: SYNC_SUBSCRIPTION_RATE,
      codec,
    })
    return {
      topic,
      clientSessionId,
    }
  }

  const clientA = initClient('A')
  const clientB = initClient('B')
  const clientC = initClient('C')

  await httpServer.start(port)

  return {
    topicContract: testTopicContract,
    clientA,
    clientB,
    clientC,
    isSubscribedClientA: <TopicName extends keyof typeof testTopicContract>(
      topicName: TopicName,
      params: s.Infer<(typeof testTopicContract)[TopicName]['params']>,
    ) => topicServer.isSubscribed(topicName, params, (c) => c.clientSessionId === clientA.clientSessionId),
    isSubscribedClientB: <TopicName extends keyof typeof testTopicContract>(
      topicName: TopicName,
      params: s.Infer<(typeof testTopicContract)[TopicName]['params']>,
    ) => topicServer.isSubscribed(topicName, params, (c) => c.clientSessionId === clientB.clientSessionId),
    isSubscribedClientC: <TopicName extends keyof typeof testTopicContract>(
      topicName: TopicName,
      params: s.Infer<(typeof testTopicContract)[TopicName]['params']>,
    ) => topicServer.isSubscribed(topicName, params, (c) => c.clientSessionId === clientC.clientSessionId),
    async restartServer() {
      await httpServer.stop()
      await httpServer.start(port)
    },
    async [Symbol.asyncDispose]() {
      await httpServer.stop()
    },
  }
}

export const ImplWebSocketInHouse = {
  init,
}

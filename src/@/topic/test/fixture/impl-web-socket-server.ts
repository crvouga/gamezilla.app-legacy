import { HttpServer } from '~/@/http-server'
import { ILogger, Logger } from '~/@/logger'
import { s } from '~/@/schema'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { TopicBasedPubSub } from '../../../pub-sub-topic-based'
import { randomServerPort } from '../../../test/random-server-port'
import { Url } from '../../../url/url'
import { TopicClient } from '../../topic-client/topic-client'
import { TopicMsgCodec } from '../../topic-msg-codec'
import { TopicServer } from '../../topic-server/topic-server'
import { RECONNECTION_RATE, SYNC_SUBSCRIPTION_RATE, testTopicContract } from './interface'

export type ImplWebSocketServer = {
  t: 'web-socket-server'
}

const init = async (_config?: ImplWebSocketServer) => {
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
    t: 'web-sockets',
    httpServer,
    logger: logger.child(['server']),
    contract: testTopicContract,
    endpoint,
    codec,
    pubSub,
  })

  const initClient = () => {
    const clientSessionId = ClientSessionId.generate()
    const topic = TopicClient.init({
      t: 'web-sockets',
      clientSessionId,
      contract: testTopicContract,
      serverUrl,
      endpoint,
      logger: logger.child(['clientA']),
      reconnectionRate: RECONNECTION_RATE,
      syncSubscriptionRate: SYNC_SUBSCRIPTION_RATE,
      codec,
    })
    return {
      topic,
      clientSessionId,
    }
  }

  const clientA = initClient()
  const clientB = initClient()
  const clientC = initClient()

  await httpServer.start(port)

  const isSubscribedClientA = <TopicName extends keyof typeof testTopicContract>(
    topicName: TopicName,
    params: s.Infer<(typeof testTopicContract)[TopicName]['params']>,
  ) => {
    return topicServer.isSubscribed(topicName, params, (c) => c.clientSessionId === clientA.clientSessionId)
  }

  const isSubscribedClientB = <TopicName extends keyof typeof testTopicContract>(
    topicName: TopicName,
    params: s.Infer<(typeof testTopicContract)[TopicName]['params']>,
  ) => {
    return topicServer.isSubscribed(topicName, params, (c) => c.clientSessionId === clientB.clientSessionId)
  }

  const isSubscribedClientC = <TopicName extends keyof typeof testTopicContract>(
    topicName: TopicName,
    params: s.Infer<(typeof testTopicContract)[TopicName]['params']>,
  ) => {
    return topicServer.isSubscribed(topicName, params, (c) => c.clientSessionId === clientC.clientSessionId)
  }

  const restartServer = async () => {
    await httpServer.stop()
    await httpServer.start(port)
  }

  return {
    topicContract: testTopicContract,
    clientA,
    clientB,
    clientC,
    isSubscribedClientA,
    isSubscribedClientB,
    isSubscribedClientC,
    restartServer,
    async [Symbol.asyncDispose]() {
      await httpServer.stop()
    },
  }
}

export const ImplWebSocketServer = {
  init,
}

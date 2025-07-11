import { HttpServer } from './@/http-server'
import { Logger } from './@/logger'
import { TopicBasedPubSub } from './@/pub-sub-topic-based'
import { Topic } from './@/topic'
import { AppTypes } from './app'
import { topicMsgCodec } from './app/@/topic-msg-codec'

const RELAY_PORT = 8888

const main = async () => {
  const logger = Logger({
    t: 'console',
    newLinePerMsg: true,
    namespace: ['relay'],
    maxLogLevel: 'info',
  })

  const httpServer = HttpServer({
    t: 'node',
    logger,
  })

  const pubSub = TopicBasedPubSub({
    t: 'in-memory',
  })

  Topic.initServer({
    t: 'web-sockets',
    contract: AppTypes.topicContract,
    endpoint: '/topic',
    httpServer,
    logger,
    codec: topicMsgCodec,
    pubSub,
  })

  await httpServer.start(RELAY_PORT)

  logger.info('Relay server started')
}

main()

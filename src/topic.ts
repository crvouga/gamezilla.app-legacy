import { DotEnv } from './@/dotenv/dotenv'
import { FileSystem } from './@/file-system'
import { HealthCheck } from './@/health-check/health-check'
import { HttpServer } from './@/http-server'
import { LoggerMiddleware } from './@/http-server/logger-middleware'
import { Logger } from './@/logger'
import { TopicBasedPubSub } from './@/pub-sub-topic-based'
import { TopicServer } from './@/topic/topic-server/topic-server'
import { AppTypes } from './app'
import { topicMsgCodec } from './app/@/topic-msg-codec'

const main = async () => {
  await DotEnv.load({ fs: FileSystem({ t: 'node' }), paths: ['.env'] })

  const logger = Logger.init({
    t: 'console',
    newLinePerMsg: false,
    namespace: ['topic'],
    maxLogLevel: 'debug',
  })

  const httpServer = HttpServer.init({
    t: 'node',
    logger,
  })

  const pubSub = TopicBasedPubSub.init({
    t: 'in-memory',
  })

  TopicServer.init({
    t: 'web-sockets',
    contract: AppTypes.topicContract,
    endpoint: '/topic',
    httpServer,
    logger,
    codec: topicMsgCodec,
    pubSub,
  })

  httpServer.registerMiddleware(LoggerMiddleware({ logger }))

  HealthCheck.registerRespond({ httpServer })

  const TOPIC_PORT = Number(process.env.TOPIC_PORT)
  if (isNaN(TOPIC_PORT)) throw new Error('TOPIC_PORT is not set')

  await httpServer.start(TOPIC_PORT)

  logger.info('Topic server started')
}

main()

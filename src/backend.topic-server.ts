import { DotEnv } from './@/dotenv/dotenv'
import { FileSystem } from './@/file-system'
import { HttpServer } from './@/http-server'
import { Logger } from './@/logger'
import { TopicBasedPubSub } from './@/pub-sub-topic-based'
import { TopicServer } from './@/topic/topic-server/impl'
import { topicMsgCodec } from './app/@/topic-msg-codec'
import { topicContract } from './app/types'

const main = async () => {
  const logger = Logger.init({
    t: 'console',
    namespace: ['topic-server'],
    newLinePerMsg: false,
    maxLogLevel: 'debug',
  })

  logger.info('Starting topic server')

  logger.info('Loading environment variables from .env file')

  await DotEnv.load({
    logger,
    fs: FileSystem.init({ t: 'node' }),
    paths: ['.env'],
    precedence: 'preserve',
    cwd: process.cwd(),
    env: process.env,
  })

  logger.info('Environment variables loaded')

  const port = Number(process.env.PORT) || 5002

  logger.info(`Port set to ${port}`)

  const httpServer = HttpServer.init({
    t: 'node',
    logger,
  })

  const pubSub = TopicBasedPubSub.init({
    t: 'in-memory',
  })

  logger.info('Initializing topic server')

  TopicServer.init({
    t: 'web-sockets-in-house',
    contract: topicContract,
    endpoint: '/topic',
    httpServer,
    logger,
    codec: topicMsgCodec,
    pubSub,
  })

  logger.info('Starting HTTP server')

  await httpServer.start(port)
}

main()

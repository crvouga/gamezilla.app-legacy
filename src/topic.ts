import { DotEnv } from './@/dotenv/dotenv'
import { FileSystem } from './@/file-system'
import { HealthCheck } from './@/health-check/health-check'
import { HttpServer } from './@/http-server'
import { LoggerMiddleware } from './@/http-server/logger-middleware'
import { Logger } from './@/logger'
import { TopicBasedPubSub } from './@/pub-sub-topic-based'
import { TopicClient } from './@/topic/topic-client/impl'
import { TopicServer } from './@/topic/topic-server/topic-server-web-socket'
import { AppTypes } from './app'
import { topicMsgCodec } from './app/@/topic-msg-codec'
import { BackendConnectionBackend } from './app/wire/backend-connection/backend'

const main = async () => {
  const logger = Logger.init({
    t: 'console',
    newLinePerMsg: false,
    namespace: ['topic'],
    maxLogLevel: 'debug',
  })

  logger.info('Starting topic server')

  logger.info('Loading environment variables from .env file')
  const fs = FileSystem.init({ t: 'node' })

  await DotEnv.load({
    fs,
    paths: ['.env'],
    precedence: 'preserve',
    cwd: process.cwd(),
    env: process.env,
  })
  logger.info('Environment variables loaded')

  logger.info('Loading configuration from environment')
  const TOPIC_PORT = Number(process.env.TOPIC_PORT)
  if (isNaN(TOPIC_PORT)) throw new Error('TOPIC_PORT is not set')
  logger.info(`Topic port set to ${TOPIC_PORT}`)

  logger.info('Initializing HTTP server')
  const httpServer = HttpServer.init({
    t: 'node',
    logger,
  })
  logger.info('HTTP server initialized')

  logger.info('Initializing pub/sub system')
  const pubSub = TopicBasedPubSub.init({
    t: 'in-memory',
  })
  logger.info('Pub/sub system initialized')

  logger.info('Initializing topic server')
  const topicServer = TopicServer.init({
    t: 'web-sockets',
    contract: AppTypes.topicContract,
    endpoint: '/topic',
    httpServer,
    logger,
    codec: topicMsgCodec,
    pubSub,
  })
  logger.info('Topic server initialized')

  logger.info('Initializing topic client')
  const topicClient = TopicClient.init({
    t: 'from-server',
    contract: AppTypes.topicContract,
    topicServer: topicServer,
    logger: logger.child(['topic-client']),
    codec: topicMsgCodec,
  })
  logger.info('Topic client initialized')

  logger.info('Starting backend connection worker')
  const abortController = new AbortController()
  BackendConnectionBackend.worker(abortController.signal, { topicClient: topicClient })
  logger.info('Backend connection worker started')

  logger.info('Registering HTTP middleware')
  httpServer.registerMiddleware(LoggerMiddleware({ logger }))
  logger.info('HTTP middleware registered')

  logger.info('Registering health check endpoint')
  HealthCheck.registerRespond({ httpServer })
  logger.info('Health check endpoint registered')

  httpServer.registerRespond((_request) => {
    const message = 'Hello from gamezilla.app topic server'
    return new Response(message, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  })

  logger.info(`Starting HTTP server on port ${TOPIC_PORT}`)
  await httpServer.start(TOPIC_PORT)

  logger.info('Topic server started')
}

main()

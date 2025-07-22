import { FileSystem } from '~/@/file-system'
import { HealthCheck } from '~/@/health-check/health-check'
import { HttpServer } from '~/@/http-server'
import { Cors } from '~/@/http-server/cors/cors'
import { CorsPolicy } from '~/@/http-server/cors/cors-policy/impl'
import { LoggerMiddleware } from '~/@/http-server/logger-middleware'
import { KeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { TopicBasedPubSub } from '~/@/pub-sub-topic-based'
import { RPC } from '~/@/rpc'
import { Runtime } from '~/@/runtime'
import { SecretString } from '~/@/secrets/secret-string'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { BackendSqlDb } from '~/@/sql-db/backend-impl'
import { SyncEngineServer } from '~/@/sync-engine/sync-engine-server'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { TopicClient } from '~/@/topic/topic-client/topic-client'
import { TopicServer } from '~/@/topic/topic-server/topic-server'
import { AppBackendCtxBase } from './@/backend/ctx'
import { topicMsgCodec } from './@/topic-msg-codec'
import { AuthBackend } from './auth/backend'
import { HelloBackend } from './backend/hello'
import { ProfileDb } from './profile/@/user-profile/user-profile-db'
import { ProfileBackend } from './profile/backend'
import { SpacesBackend } from './spaces/backend'
import * as AppTypes from './types'
import { BackendCtxModule, rpcContract } from './types'
import { WireBackend } from './wire/backend'

const initCtx = async (config: {
  port: number
  topicUrl: string
  databaseUrl: SecretString
  isProd: boolean
  logger: ILogger
}): Promise<BackendCtxModule> => {
  const logger = config.logger.child(['app'])

  logger.info('Initializing backend context')

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const sqlDb = BackendSqlDb.init({
    t: 'postgres',
    databaseUrl: config.databaseUrl,
    logger,
  })

  const migrationPolicy = SqlDbMigrationPolicy.init({
    t: 'never-run',
    logger,
  })

  const keyValueDbDurable = KeyValueDb.init({
    t: 'sql-db',
    sqlDb,
    logger,
    migrationPolicy,
  })

  const pubSub = TopicBasedPubSub.init({
    t: 'sql-db',
    sqlDb,
    logger,
  })

  const httpServer = HttpServer.init({
    t: 'node',
    logger,
  })

  httpServer.registerMiddleware(
    Cors.middleware(
      CorsPolicy.init({
        t: 'allow-sub-domains',
        allowedDomains: [],
        allowServerDomain: true,
        logger,
      }),
    ),
  )

  const topicServer = TopicServer.init({
    t: 'web-sockets',
    contract: AppTypes.topicContract,
    endpoint: '/topic',
    httpServer,
    logger,
    codec: topicMsgCodec,
    pubSub,
  })

  const topicClient = TopicClient.init({
    t: 'for-server',
    contract: AppTypes.topicContract,
    codec: topicMsgCodec,
    topicServer,
    logger: logger.child(['topic-client']),
  })

  const userProfileDb = ProfileDb({
    t: 'sql',
    sqlDb,
    logger,
    migrationPolicy,
  })

  const env = config.isProd ? 'prod' : 'dev'

  const now = UnixMs.now()

  const syncEngine = SyncEngineServer({
    logger,
  })

  const fileSystem = FileSystem.init({ t: 'node' })

  const ctxBase: AppBackendCtxBase = {
    fileSystem,
    syncEngine,
    env,
    sqlDb,
    keyValueDbDurable,
    logger,
    now,
    pubSub,
    userProfileDb,
    httpServer,
    runtime,
    migrationPolicy,
    port: config.port,
  }

  const wire = await WireBackend.initCtx({ ctx: ctxBase, topic: topicClient })
  const profile = await ProfileBackend.initCtx({ ctx: ctxBase })
  const spaces = await SpacesBackend.initCtx({ ctx: ctxBase, topic: topicClient })
  const auth = await AuthBackend.initCtx({ ctx: ctxBase })

  const ctx: BackendCtxModule = {
    ...ctxBase,
    ...auth,
    ...spaces,
    ...profile,
    ...wire,
    topic: topicClient,
  }

  return ctx
}

const rpc = (input: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    ...WireBackend.rpc(input),
    ...AuthBackend.rpc(input),
    ...SpacesBackend.rpc(input),
  })
}

const worker = async (s: AbortSignal, input: { ctx: BackendCtxModule }) => {
  input.ctx.logger.info('Starting backend worker')

  input.ctx.httpServer.registerMiddleware(LoggerMiddleware({ logger: input.ctx.logger }))

  RPC.registerRespond({
    httpServer: input.ctx.httpServer,
    logger: input.ctx.logger,
    contract: AppTypes.rpcContract,
    server: AppBackend.rpc({ ctx: input.ctx }),
  })

  HealthCheck.registerRespond({ httpServer: input.ctx.httpServer })
  HelloBackend.registerRespond({ ctx: input.ctx, httpServer: input.ctx.httpServer })

  input.ctx.httpServer.start(input.ctx.port)

  WireBackend.worker(s, input)
  AuthBackend.worker(s, input)
  SpacesBackend.worker(s, input)
  ProfileBackend.worker(s, input)
}

export const AppBackend = {
  initCtx,
  rpc,
  worker,
}

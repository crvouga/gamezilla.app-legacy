import { FileSystem } from '~/@/file-system'
import { HealthCheck } from '~/@/health-check/health-check'
import { HttpClient } from '~/@/http-client/impl'
import { HttpServer } from '~/@/http-server'
import { Cors } from '~/@/http-server/cors/cors'
import { CorsPolicy } from '~/@/http-server/cors/cors-policy/impl'
import { LoggerMiddleware } from '~/@/http-server/logger-middleware'
import { KeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { TopicBasedPubSub } from '~/@/pub-sub-topic-based'
import { RPC } from '~/@/rpc'
import { Runtime } from '~/@/runtime'
import { ServerRegistry } from '~/@/server-registry/server-registry'
import { SinglePageApp } from '~/@/single-page-app'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { validatePolicyDatabaseCompatibility } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb, validateProductionDatabaseConfig } from '~/@/sql-db/interface'
import { SyncEngineServer } from '~/@/sync-engine/sync-engine-server'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { TopicClient } from '~/@/topic/topic-client/impl'
import { Url } from '~/@/url/url'
import { ClientSessionId } from '~/@/wire/client-session-id'
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
  isProd: boolean
  logger: ILogger
  sqlDb: ISqlDb
}): Promise<BackendCtxModule> => {
  const logger = config.logger.child(['app'])

  logger.info('Initializing backend context')

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const migrationPolicy = SqlDbMigrationPolicy.init({
    t: 'never-run', // NEVER run migrations against production database
    logger,
  })

  // CRITICAL: Validate database configuration before proceeding
  // This provides multiple layers of redundancy to prevent accidental migrations
  await validateProductionDatabaseConfig(config.sqlDb, migrationPolicy, 'AppBackend.initCtx')

  // Additional validation: Check policy-database compatibility
  await validatePolicyDatabaseCompatibility(migrationPolicy, config.sqlDb, 'AppBackend.initCtx')

  const keyValueDbDurable = KeyValueDb.init({
    t: 'sql-db',
    sqlDb: config.sqlDb,
    logger,
    migrationPolicy,
  })

  const pubSub = TopicBasedPubSub.init({
    t: 'sql-db',
    sqlDb: config.sqlDb,
    logger,
  })

  const httpServer = HttpServer.init({
    t: 'node',
    logger,
  })

  const serverRegistry = ServerRegistry.init({
    httpClient: HttpClient.init({ t: 'fetch' }),
    logger,
    serverRegistrySrcUrl: Url.derive(process.env.SERVER_REGISTRY_SRC_URL ?? '', 'http'),
    sqlDb: config.sqlDb,
    migrationPolicy,
    pollRate: TimeSpan.seconds(10),
  })

  const topicClient = TopicClient.init({
    t: 'web-sockets-in-house',
    contract: AppTypes.topicContract,
    codec: topicMsgCodec,
    logger: logger.child(['topic-client']),
    getServerUrls: serverRegistry.getServerUrls,
    clientSessionId: ClientSessionId.generate(),
  })

  const userProfileDb = ProfileDb({
    t: 'sql',
    sqlDb: config.sqlDb,
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
    sqlDb: config.sqlDb,
    keyValueDbDurable,
    logger,
    now,
    pubSub,
    userProfileDb,
    httpServer,
    runtime,
    migrationPolicy,
    port: config.port,
    serverRegistry,
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
    ...AuthBackend.rpc(input),
    ...SpacesBackend.rpc(input),
  })
}

const server = async (input: { ctx: BackendCtxModule }) => {
  const logger = input.ctx.logger.child(['backend'])
  logger.info('Starting backend server')
  input.ctx.httpServer.registerMiddleware(LoggerMiddleware({ logger }))
  input.ctx.httpServer.registerMiddleware(
    Cors.middleware(
      CorsPolicy.init({
        t: 'allow-sub-domains',
        allowedDomains: ['*'],
        allowRequestHostDomain: true,
        logger,
      }),
    ),
  )
  RPC.register({
    t: 'http-server',
    httpServer: input.ctx.httpServer,
    logger,
    contract: AppTypes.rpcContract,
    server: rpc({ ctx: input.ctx }),
  })
  HealthCheck.register({ httpServer: input.ctx.httpServer })
  SinglePageApp.register({
    directory: 'dist',
    fs: input.ctx.fileSystem,
    httpServer: input.ctx.httpServer,
    indexFilename: 'index.html',
    logger,
  })
  HelloBackend.register({ ctx: input.ctx, httpServer: input.ctx.httpServer })
  input.ctx.httpServer.start(input.ctx.port)
}

const worker = async (s: AbortSignal, input: { ctx: BackendCtxModule }) => {
  input.ctx.serverRegistry.worker(s)
  WireBackend.worker(s, input)
  AuthBackend.worker(s, input)
  SpacesBackend.worker(s, input)
  ProfileBackend.worker(s, input)
}

export const AppBackend = {
  rpc,
  initCtx,
  server,
  worker,
}

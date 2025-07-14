import { FileSystem } from '~/@/file-system'
import { HttpServer } from '~/@/http-server'
import { AllowCORS } from '~/@/http-server/allow-cors'
import { KeyValueDb } from '~/@/key-value-db'
import { Logger } from '~/@/logger'
import { TopicBasedPubSub } from '~/@/pub-sub-topic-based'
import { RPC } from '~/@/rpc'
import { Runtime } from '~/@/runtime'
import { SecretString } from '~/@/secrets/secret-string'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { SyncEngineServer } from '~/@/sync-engine/sync-engine-server'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Topic } from '~/@/topic'
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
  corsOrigins: string[]
  isProd: boolean
}): Promise<BackendCtxModule> => {
  const logger = Logger({ t: 'console', namespace: ['backend'], newLinePerMsg: false, maxLogLevel: 'info' })

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const sqlDb = SqlDb({
    t: 'postgres',
    databaseUrl: config.databaseUrl,
    logger,
  })

  const migrationPolicy = SqlDbMigrationPolicy({
    t: 'never-run',
    logger,
  })

  const keyValueDbDurable = KeyValueDb({
    t: 'sql-db',
    sqlDb,
    logger,
  })

  const pubSub = TopicBasedPubSub({
    t: 'sql-db',
    sqlDb,
    logger,
  })

  const httpServer = HttpServer({
    t: 'node',
    logger,
  })

  httpServer.registerMiddleware(AllowCORS.middleware(config.corsOrigins))

  const topic = Topic.initServer({
    t: 'web-sockets',
    contract: AppTypes.topicContract,
    endpoint: '/topic',
    httpServer,
    logger,
    codec: topicMsgCodec,
    pubSub,
  })

  const userProfileDb = ProfileDb({
    t: 'sql',
    sqlDb,
    logger,
  })

  const env = config.isProd ? 'prod' : 'dev'

  const now = UnixMs.now()

  const syncEngine = SyncEngineServer({
    logger,
  })

  const fileSystem = FileSystem({ t: 'node' })

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

  const wire = await WireBackend.initCtx({ ctx: ctxBase, topic })
  const profile = await ProfileBackend.initCtx({ ctx: ctxBase })
  const spaces = await SpacesBackend.initCtx({ ctx: ctxBase, topic })
  const auth = await AuthBackend.initCtx({ ctx: ctxBase })

  const ctx: BackendCtxModule = {
    ...ctxBase,
    ...auth,
    ...spaces,
    ...profile,
    ...wire,
    topic,
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
  RPC.registerRespond({
    httpServer: input.ctx.httpServer,
    logger: input.ctx.logger,
    contract: AppTypes.rpcContract,
    server: AppBackend.rpc({ ctx: input.ctx }),
  })

  HelloBackend.registerRespond({
    ctx: input.ctx,
    httpServer: input.ctx.httpServer,
  })

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

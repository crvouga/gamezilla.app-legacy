import { FileSystem, IFileSystem } from '~/@/file-system'
import { HttpServer } from '~/@/http-server'
import { AllowCORS } from '~/@/http-server/allow-cors'
import { KeyValueDb } from '~/@/key-value-db'
import { ILogger, Logger } from '~/@/logger'
import { IMigrationPolicy, MigrationPolicy } from '~/@/migration-policy'
import { sleep } from '~/@/promise/sleep'
import { PubSubTopicBased } from '~/@/pub-sub-topic-based'
import { RPC } from '~/@/rpc'
import { Runtime } from '~/@/runtime'
import { ISqlDb } from '~/@/sql-db'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { SyncEngine } from '~/@/sync-engine/sync-engine-server'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Topic } from '~/@/topic'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { BackendInstanceId } from './@/backend/backend-instance/backend-instance-id'
import { BackendRole } from './@/backend/backend-role'
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

const initCtx = async (config: { backendRole: BackendRole; port: number }): Promise<BackendCtxModule> => {
  const logger = Logger({ t: 'console', namespace: ['backend'], newLinePerMsg: false, maxLogLevel: 'info' })

  logger.info(`Starting ${config.backendRole} backend...`)

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const fs = FileSystem({ t: 'node' })

  const { sqlDb, migrationPolicy } = await initSqlDb({
    backendRole: config.backendRole,
    logger,
    fs,
  })

  const keyValueDbDurable = KeyValueDb({
    t: 'sql-db',
    sqlDb,
    logger,
  })

  const pubSub = await PubSubTopicBased({
    t: 'postgres',
    sqlDb,
    logger,
  })

  const httpServer = HttpServer({
    t: 'node',
    logger,
  })

  httpServer.registerMiddleware(AllowCORS.middleware(CONFIG_BACKEND.CORS_ORIGINS))

  const topic = Topic.initServer({
    t: 'web-sockets',
    contract: AppTypes.topicContract,
    endpoint: '/topic',
    httpServer,
    logger,
    isProd: CONFIG_SHARED.IS_PROD,
    codec: topicMsgCodec,
  })

  const userProfileDb = ProfileDb({
    t: 'sql',
    sqlDb,
    logger,
  })

  const env = CONFIG_SHARED.IS_PROD ? 'prod' : 'dev'

  const now = UnixMs.now()

  const backendInstanceId = BackendInstanceId.generate()

  const syncEngine = SyncEngine({
    t: 'backend',
    logger,
  })

  const ctxBase: AppBackendCtxBase = {
    syncEngine,
    backendRole: config.backendRole,
    env,
    sqlDb,
    keyValueDbDurable,
    logger,
    now,
    backendInstanceId,
    sleep,
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

const initSqlDb = async (config: {
  backendRole: BackendRole
  logger: ILogger
  fs: IFileSystem
}): Promise<{ sqlDb: ISqlDb; migrationPolicy: IMigrationPolicy }> => {
  switch (config.backendRole) {
    case 'primary': {
      return {
        sqlDb: SqlDb({
          t: 'postgres',
          databaseUrl: CONFIG_BACKEND.DATABASE_URL(),
          logger: config.logger,
        }),
        migrationPolicy: MigrationPolicy({ t: 'never-run', logger: config.logger }),
      }
    }
    case 'edge': {
      return {
        sqlDb: SqlDb({
          t: 'better-sqlite3',
          databasePath: ':memory:',
          logger: config.logger,
          fs: config.fs,
        }),
        migrationPolicy: MigrationPolicy({ t: 'always-run', logger: config.logger }),
      }
    }
  }
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

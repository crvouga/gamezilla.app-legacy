import { AllowCORS } from '~/@/http-server/allow-cors'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { KeyValueDb } from '~/@/key-value-db'
import { ILogger, Logger } from '~/@/logger'
import { sleep } from '~/@/promise/sleep'
import { PubSubTopicBased } from '~/@/pub-sub-topic-based'
import { RPC } from '~/@/rpc'
import { Runtime } from '~/@/runtime'
import { ISqlDb } from '~/@/sql-db'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Topic } from '~/@/topic'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { PowerSyncBackend } from '~/service-powersync/backend'
import { AppTypes } from '.'
import { BackendInstanceId } from './@/backend/backend-instance/backend-instance-id'
import { BackendRole } from './@/backend/backend-role'
import { AppBackendCtxBase } from './@/backend/ctx'
import { topicMsgCodec } from './@/topic-msg-codec'
import { AuthBackend } from './auth/backend'
import { HelloBackend } from './backend/hello'
import { ProfileDb } from './profile/@/user-profile/user-profile-db'
import { ProfileBackend } from './profile/backend'
import { SpacesBackend } from './spaces/backend'
import { BackendCtxModule, rpcContract } from './types'
import { WireBackend } from './wire/backend'
import { PowerSyncClient } from '~/service-powersync/client/powersync-client'
import { BackendConnector } from '~/service-powersync/client/backend-connector'

const initCtx = async (config: { backendRole: BackendRole }): Promise<BackendCtxModule> => {
  const logger = Logger({ t: 'console' })

  logger.info(`Starting ${config.backendRole} backend...`)

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const sqlDb = await initSqlDb({
    backendRole: config.backendRole,
    logger,
  })

  const keyValueDbDurable = await KeyValueDb({
    t: 'sql-db',
    sqlDb,
    logger,
  })

  const pubSub = await PubSubTopicBased({
    t: 'postgres',
    sqlDb,
    logger,
  })

  const httpServer = HttpServerBun({
    t: 'bun',
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

  const ctxBase: AppBackendCtxBase = {
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

  RPC.registerRespond({
    httpServer: ctx.httpServer,
    contract: AppTypes.rpcContract,
    server: AppBackend.rpc({ ctx }),
  })

  PowerSyncBackend.registerRespond({
    ctx,
    httpServer: ctx.httpServer,
  })

  HelloBackend.registerRespond({
    ctx,
    httpServer: ctx.httpServer,
  })

  return ctx
}

const initSqlDb = async (config: { backendRole: BackendRole; logger: ILogger }): Promise<ISqlDb> => {
  switch (config.backendRole) {
    case 'primary': {
      return SqlDb({
        t: 'postgres',
        databaseUrl: CONFIG_BACKEND.DATABASE_URL(),
        logger: config.logger,
      })
    }
    case 'edge': {
      return SqlDb({
        t: 'powersync-client',
        logger: config.logger,
        powerSyncClient: await PowerSyncClient({
          t: 'node.js',
          logger: config.logger,
          debug: true,
          backendConnector: new BackendConnector({
            backendUrl: CONFIG_SHARED.BACKEND_URL,
            powersyncUrl: CONFIG_SHARED.POWERSYNC_URL,
            logger: config.logger,
          }),
        }),
      })
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
  input.ctx.httpServer.start(CONFIG_BACKEND.PORT())

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

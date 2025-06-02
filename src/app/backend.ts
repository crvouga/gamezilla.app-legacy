import { SqlDb } from '~/@/sql-db/backend/impl'
import { AllowCORS } from '~/@/http-server/allow-cors'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { KeyValueDb } from '~/@/key-value-db'
import { Logger } from '~/@/logger'
import { sleep } from '~/@/promise/sleep'
import { PubSubTopicBased } from '~/@/pub-sub-topic-based'
import { RPC } from '~/@/rpc'
import { Runtime } from '~/@/runtime'
import { SMS } from '~/@/sms'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { Topic } from '~/@/topic'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { PowerSyncBackendApp } from '~/service-powersync/backend/respond'
import { AppTypes } from '.'
import { BackendInstanceId } from './@/backend/backend-instance/backend-instance-id'
import { AppBackendCtxBase } from './@/backend/ctx'
import { AuthBackend } from './auth/backend'
import { ProfileDb } from './profile/@/user-profile/user-profile-db'
import { ProfileBackend } from './profile/backend'
import { SpacesBackend } from './spaces/backend'
import { BackendCtxModule, rpcContract } from './types'
import { WireBackend } from './wire/backend'

const initCtx = async (): Promise<BackendCtxModule> => {
  const logger = Logger({ t: 'console' })

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const sqlDbPostgres = await SqlDb({
    t: 'postgres',
    databaseUrl: CONFIG_BACKEND.DATABASE_URL,
    logger,
  })

  const keyValueDbDurable = await KeyValueDb({
    t: 'sql-db',
    sqlDb: sqlDbPostgres,
    logger,
  })

  const sms = SMS({
    t: 'twilio',
    logger,
  })

  const pubSub = await PubSubTopicBased({
    t: 'postgres',
    sqlDb: sqlDbPostgres,
    logger,
  })

  const httpServer = HttpServerBun({
    t: 'bun',
    logger,
  })

  httpServer.registerMiddleware(AllowCORS.middleware)

  const topic = Topic.initServer({
    t: 'web-sockets',
    contract: AppTypes.topicContract,
    endpoint: '/topic',
    httpServer,
    logger,
    isProd: CONFIG_SHARED.IS_PROD,
  })

  const userProfileDb = ProfileDb({
    t: 'sql',
    sqlDb: sqlDbPostgres,
    logger,
  })

  const env = CONFIG_SHARED.IS_PROD ? 'prod' : 'dev'

  const now = Posix.now()

  const backendInstanceId = BackendInstanceId.generate()

  const ctxBase: AppBackendCtxBase = {
    env,
    sms,
    postgres: sqlDbPostgres,
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
    contract: AppTypes.rpcContract,
    server: AppBackend.rpc(input),
  })

  PowerSyncBackendApp.registerRespond({
    ctx: input.ctx,
    httpServer: input.ctx.httpServer,
  })

  input.ctx.httpServer.registerRespond(() => {
    return new Response('Hello from gamezilla.app backend', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  })

  input.ctx.httpServer.start(CONFIG_BACKEND.SERVER_PORT!)

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

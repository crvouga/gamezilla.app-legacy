import { AllowCORS } from '~/@/http-server/allow-cors'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { KeyValueDb } from '~/@/key-value-db'
import { Logger } from '~/@/logger'
import { sleep } from '~/@/promise/sleep'
import { PubSubTopicBased } from '~/@/pub-sub-topic-based'
import { RPC } from '~/@/rpc'
import { Runtime } from '~/@/runtime'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { UnixMs } from '~/@/time/unix-ms'
import { TimeSpan } from '~/@/time/time-span'
import { Topic } from '~/@/topic'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { PowerSyncBackend } from '~/service-powersync/backend'
import { AppTypes } from '.'
import { BackendInstanceId } from './@/backend/backend-instance/backend-instance-id'
import { AppBackendCtxBase } from './@/backend/ctx'
import { topicMsgCodec } from './@/topic-msg-codec'
import { AuthBackend } from './auth/backend'
import { ProfileDb } from './profile/@/user-profile/user-profile-db'
import { ProfileBackend } from './profile/backend'
import { SpacesBackend } from './spaces/backend'
import { BackendCtxModule, rpcContract } from './types'
import { WireBackend } from './wire/backend'
import { BackendRole } from './@/backend/backend-role'

const initCtx = async (config: { role: BackendRole }): Promise<BackendCtxModule> => {
  const logger = Logger({ t: 'console' })

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const sqlDb =
    config.role === 'primary'
      ? await SqlDb({ t: 'postgres', databaseUrl: CONFIG_BACKEND.DATABASE_URL(), logger })
      : await SqlDb({ t: 'noop' })

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

  httpServer.registerMiddleware(AllowCORS.middleware)

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
    role: config.role,
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

  ctx.httpServer.registerRespond(() => {
    const message =
      config.role === 'primary' ? 'Hello from gamezilla.app primary backend' : 'Hello from gamezilla.app edge backend'
    return new Response(message, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  })

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

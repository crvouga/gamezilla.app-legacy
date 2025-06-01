import { fork } from 'redux-saga/effects'
import { DbConnSql } from '~/@/db-conn-sql/backend/impl'
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

  const simulateLatency = CONFIG_SHARED.IS_PROD
    ? async () => {}
    : async () => sleep(TimeSpan.milliseconds(100 + Math.random() * 100))

  const dbConnSql = await DbConnSql({
    t: 'postgres',
    databaseUrl: CONFIG_BACKEND.DATABASE_URL,
    logger,
    simulateLatency,
  })

  const keyValueDb = await KeyValueDb({
    t: 'db-conn-sql',
    dbConnSql,
    logger,
  })

  const sms = SMS({
    t: 'twilio',
    logger,
  })

  const httpServer = HttpServerBun({
    t: 'bun',
    logger,
  })

  const pubSub = await PubSubTopicBased({ t: 'noop' })

  const topic = Topic.initServer({
    t: 'web-sockets',
    contract: AppTypes.topicContract,
    endpoint: '/topic',
    httpServer,
    logger: Logger({ t: 'noop' }),
    isProd: CONFIG_SHARED.IS_PROD,
  })

  const userProfileDb = ProfileDb({
    t: 'sql',
    dbConnSql,
    logger,
  })

  const env = CONFIG_SHARED.IS_PROD ? 'prod' : 'dev'

  const now = Posix.now()

  const backendInstanceId = BackendInstanceId.generate()

  const ctx: AppBackendCtxBase = {
    env,
    sms,
    dbConnSql,
    keyValueDb,
    logger,
    now,
    backendInstanceId,
    sleep,
    pubSub,
    userProfileDb,
    httpServer,
    runtime,
  }

  const wire = await WireBackend.initCtx({ ctx, topic })
  const profile = await ProfileBackend.initCtx({ ctx })
  const space = await SpacesBackend.initCtx({ ctx, topic })
  const auth = await AuthBackend.initCtx({ ctx })

  return {
    ...ctx,
    httpServer,
    auth,
    spaces: space,
    profile,
    wire,
    topic,
  }
}

const rpc = (ctx: BackendCtxModule) => {
  return RPC.initServer(rpcContract, {
    ...WireBackend.rpc(ctx.wire),
    ...AuthBackend.rpc({ ctx: ctx.auth }),
    ...SpacesBackend.rpc({ ctx: ctx.spaces }),
  })
}

const saga = function* (ctx: BackendCtxModule) {
  yield fork(WireBackend.saga, ctx.wire)
  yield fork(AuthBackend.saga, ctx.auth)
  yield fork(SpacesBackend.saga, ctx.spaces)
  yield fork(ProfileBackend.saga, ctx.profile)
}

export const AppBackend = {
  initCtx,
  rpc,
  saga,
}

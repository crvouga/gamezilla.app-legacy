import { DbConnSql } from '~/@/db-conn-sql/backend/impl'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { KeyValueDb } from '~/@/key-value-db'
import { Logger } from '~/@/logger'
import { ILogger } from '~/@/logger/interface'
import { Msg } from '~/@/msg/msg'
import { sleep } from '~/@/promise/sleep'
import { PubSubTopicBased } from '~/@/pub-sub-topic-based'
import { RPC } from '~/@/rpc'
import { Runtime } from '~/@/runtime'
import { SMS } from '~/@/sms'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { Topic } from '~/@/topic'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { AppTypes } from '.'
import { BackendInstanceId } from './@/backend/backend-instance/backend-instance-id'
import { AppBackendCtxBase } from './@/backend/ctx'
import { AuthBackend } from './auth/backend'
import { LangBackend } from './lang/backend'
import { ProfileDb } from './profile/@/user-profile/user-profile-db'
import { ProfileBackend } from './profile/backend'
import { SpacesBackend } from './spaces/backend'
import { BackendCtxModule, rpcContract, type MsgBackend } from './types'
import { WireBackend } from './wire/backend'

//
//
//
//
//
//
//

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
    logger,
    isProd: CONFIG_SHARED.IS_PROD,
  })

  const profileDb = ProfileDb({
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
    userProfileDb: profileDb,
    httpServer,
    runtime,
  }

  const wire = await WireBackend.initCtx({ ctx, topic: topic.wire })
  const profile = await ProfileBackend.initCtx({ ctx })
  const space = await SpacesBackend.initCtx({ ctx, topic: topic.spaces })
  const auth = await AuthBackend.initCtx({ ctx })

  return {
    ...ctx,
    httpServer,
    auth,
    space,
    profile,
    wire,
    topic,
  }
}

const updateCtx = (ctx: BackendCtxModule): BackendCtxModule => {
  return {
    ...ctx,
    now: Posix.now(),
  }
}

//
//
//
//
//
//
//

const init = async (_input: { ctx: BackendCtxModule }): Promise<{}> => {
  return {}
}

//
//
//
//
//
//
//

const update = async (input: { msg: MsgBackend; ctx: BackendCtxModule }): Promise<{}> => {
  logMsg({ msg: input.msg, logger: input.ctx.logger })

  const updated = await updateChild({ ctx: input.ctx, msg: input.msg })

  await updateLoop(input.ctx, updated)

  return {}
}

const logMsg = ({ msg, msgIn, logger }: { logger: ILogger; msg?: MsgBackend | null; msgIn?: unknown | null }) => {
  const prefix = msg ? '[msg]' : msgIn ? '[in]' : '[out]'

  const obj = { ...msg, ...(typeof msgIn === 'object' ? msgIn : null) }

  const log = [prefix, Msg.toType(obj)]

  logger.info(log.join(' '))
}

const updateLoop = async (
  ctx: BackendCtxModule,
  acc: {
    msgOut: unknown[]
  },
): Promise<{
  msgOut: unknown[]
}> => {
  const [msgOut, ...msgOutRest] = acc.msgOut

  if (msgOut) {
    const updatedOut = await updateChild({ ctx, msgIn: msgOut })

    logMsg({ msgIn: msgOut, logger: ctx.logger })

    return updateLoop(ctx, {
      msgOut: Msg.batch(msgOutRest, updatedOut.msgOut),
    })
  }

  return acc
}

const updateChild = async (input: {
  ctx: BackendCtxModule
  msg?: MsgBackend | null
  msgIn?: unknown | null
}): Promise<{
  msgOut: unknown[]
}> => {
  const [space, auth, wire, profile, lang] = await Promise.all([
    SpacesBackend.update({
      ctx: input.ctx.space,
      msg: input.msg?.t === 'spaces' ? input.msg.c : null,
      msgIn: input.msgIn,
    }),
    AuthBackend.update({
      ctx: input.ctx.auth,
      msg: input.msg?.t === 'auth' ? input.msg.c : null,
      msgIn: input.msgIn,
    }),
    WireBackend.update({
      ctx: input.ctx.wire,
      msg: input.msg?.t === 'wire' ? input.msg.c : null,
      msgIn: input.msgIn,
    }),
    ProfileBackend.update({
      ctx: input.ctx.profile,
      msg: input.msg?.t === 'profile' ? input.msg.c : null,
      msgIn: input.msgIn,
    }),
    LangBackend.update({
      ctx: input.ctx,
      msgIn: input.msgIn,
      msg: input.msg?.t === 'lang' ? input.msg.c : null,
    }),
  ])

  return {
    msgOut: Msg.batch(space.msgOut, auth.msgOut, wire.msgOut, profile.msgOut, lang.msgOut),
  }
}

const subscriptions = async (input: { ctx: BackendCtxModule }): Promise<Sub<MsgBackend>> => {
  return Sub.batch<MsgBackend>([
    Sub.tag('spaces', await SpacesBackend.subscriptions({ ctx: input.ctx.space })),
    Sub.tag('wire', await WireBackend.subscriptions({ ctx: input.ctx.wire })),
  ])
}

const rpc = (input: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    wire: WireBackend.rpc({ ctx: input.ctx.wire }),
    auth: AuthBackend.rpc({ ctx: input.ctx.auth }),
    spaces: SpacesBackend.rpc({ ctx: input.ctx.space }),
  })
}

export const AppBackend = {
  initCtx,
  updateCtx,
  init,
  update,
  subscriptions,
  rpc,
}

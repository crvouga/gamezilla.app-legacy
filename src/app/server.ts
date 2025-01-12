import { DbConnKv } from '~/@/db-conn-kv'
import { DbConnSql } from '~/@/db-conn-sql'
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
import { WebBackend } from '~/@/web-server'
import { DATABASE_URL } from '~/config/server'
import { IS_PROD, SERVER_IMPL } from '~/config/shared'
import { BackendCmd } from './@/server/cmd'
import { AppBackendCtx } from './@/server/ctx'
import { BackendEvt } from './@/server/evt'
import { ProfileCache } from './@/server/profile-cache'
import { BackendInstanceId } from './@/server/server-instance/server-instance-id'
import * as AuthBackend from './auth/server'
import * as LangBackend from './lang/server'
import * as ProfileBackend from './profile/server'
import { SpacesBackend } from './spaces/server'
import {
  rpcContract,
  BackendCtx,
  type MsgBackend,
  type MsgToClient,
  type MsgToBackend,
  type MsgToBackendMeta,
} from './types'
import * as WireBackend from './wire/server'
import { BackendTransport } from './wire/transport/server'

//
//
//
//
//
//
//

const initCtx = async (): Promise<BackendCtx> => {
  const logger = Logger({ t: 'console' })

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const simulateLatency = IS_PROD ? async () => {} : async () => sleep(TimeSpan.milliseconds(100 + Math.random() * 100))

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  const dbConnSql = await DbConnSql({
    t: 'postgres',
    databaseUrl: DATABASE_URL,
    logger,
    simulateLatency,
  })

  const dbConnKv = await DbConnKv({
    t: 'postgres',
    dbConnSql,
    logger,
  })

  const sms = SMS({
    t: 'twilio',
    logger,
  })

  const webBackend = WebBackend({
    logger,
    t: SERVER_IMPL,
  })

  const pubSub = await PubSubTopicBased({
    t: 'noop',
  })

  const transport = await BackendTransport<MsgToBackend, MsgToClient>(
    webBackend.t === 'bun'
      ? {
          t: 'bun-web-sockets',
          dbConnSql,
          webBackend,
          logger,
          pubSubTopicBased: pubSub,
          isProd: IS_PROD,
        }
      : {
          t: 'noop',
          logger,
        },
  )

  const profileCache = await ProfileCache({
    t: 'cached-db-conn-kv',
    dbConnKv,
    logger,
    runtime,
  })

  const env = IS_PROD ? 'prod' : 'dev'

  const ctx: AppBackendCtx = {
    env,
    sms,
    dbConnSql,
    dbConnKv,
    logger,
    now: Posix.now(),
    sleep,
    pubSub,
    profileCache,
    webBackend,
    runtime,
    serverInstanceId: BackendInstanceId.generate(),
  }

  const wire = await WireBackend.initCtx({ ctx, transport })
  const profile = await ProfileBackend.initCtx({ ctx })
  const space = await SpacesBackend.initCtx({ ctx })
  const auth = await AuthBackend.initCtx({ ctx })

  return {
    ...ctx,
    webBackend: webBackend,
    auth,
    space,
    profile,
    wire,
    transport,
  }
}

const updateCtx = (ctx: BackendCtx): BackendCtx => {
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

const init = async (_input: { ctx: BackendCtx }): Promise<{}> => {
  return {}
}

//
//
//
//
//
//
//

const update = async (input: { msg: MsgBackend; ctx: BackendCtx }): Promise<{}> => {
  logMsg({ msg: input.msg, logger: input.ctx.logger })

  const updated = await updateChild({
    ctx: input.ctx,
    msg: input.msg,
    msgClient: input.msg.t === '→' ? { ...input.msg, ...input.msg.c } : null,
  })

  await updateLoop(input.ctx, updated)

  return {}
}

const logMsg = ({
  msg,
  msgEvt,
  msgCmd,
  logger,
}: {
  logger: ILogger
  msg?: MsgBackend | null
  msgEvt?: BackendEvt | null
  msgCmd?: BackendCmd<MsgToClient> | null
}) => {
  const prefix = msg ? '[msg]' : msgEvt ? '[evt]' : '[cmd]'

  const obj = { ...msg, ...msgEvt, ...msgCmd }

  const sentMsgType =
    msgCmd?.c.t === 'send-to-client' || msgCmd?.c.t === 'send-to-user' || msgCmd?.c.t === 'broadcast'
      ? Msg.toType(msgCmd.c.msg)
      : null

  const log = [prefix, Msg.toType(obj)]

  if (sentMsgType) {
    log.push(`sent ${sentMsgType}`)
  }

  logger.info(log.join(' '))
}

const updateLoop = async (
  ctx: BackendCtx,
  acc: {
    msgEvt: BackendEvt[]
    msgCmd: BackendCmd<MsgToClient>[]
  },
): Promise<{
  msgEvt: BackendEvt[]
  msgCmd: BackendCmd<MsgToClient>[]
}> => {
  const [msgCmd, ...msgCmdRest] = acc.msgCmd

  if (msgCmd) {
    const updatedCmd = await updateChild({ ctx, msgCmd })

    logMsg({ msgCmd, logger: ctx.logger })

    return updateLoop(ctx, {
      msgCmd: Msg.batch(msgCmdRest, updatedCmd.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updatedCmd.msgEvt),
    })
  }

  const [msgEvt, ...msgEvtRest] = acc.msgEvt

  if (msgEvt) {
    const updatedEvent = await updateChild({ ctx, msgEvt })

    logMsg({ msgEvt, logger: ctx.logger })

    return updateLoop(ctx, {
      msgCmd: Msg.batch(msgCmdRest, updatedEvent.msgCmd),
      msgEvt: Msg.batch(msgEvtRest, updatedEvent.msgEvt),
    })
  }

  return acc
}

const updateChild = async (input: {
  ctx: BackendCtx
  msg?: MsgBackend | null
  msgClient?: (MsgToBackend & MsgToBackendMeta) | null
  msgEvt?: BackendEvt | null
  msgCmd?: BackendCmd<MsgToClient> | null
}): Promise<{
  msgEvt: BackendEvt[]
  msgCmd: BackendCmd<MsgToClient>[]
}> => {
  const userId = await AuthBackend.getUserIdFromSessionId(input.ctx.auth, input.msgClient?.sessionId)

  const [space, auth, wire, profile, lang] = await Promise.all([
    SpacesBackend.update({
      deps: null,
      ctx: input.ctx.space,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'spaces' ? { ...input.msgClient, ...input.msgClient.c, userId } : null,
      msg: input.msg?.t === 'spaces' ? input.msg.c : null,
    }),

    AuthBackend.update({
      deps: null,
      ctx: input.ctx.auth,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'auth' ? { ...input.msgClient, ...input.msgClient.c, userId } : null,
      msg: input.msg?.t === 'auth' ? input.msg.c : null,
    }),

    WireBackend.update({
      ctx: input.ctx.wire,
      msgCmd: input.msgCmd?.t === 'wire' ? input.msgCmd : null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'wire' ? { ...input.msgClient, ...input.msgClient.c } : null,
      msg: input.msg?.t === 'wire' ? input.msg.c : null,
    }),

    ProfileBackend.update({
      deps: null,
      ctx: input.ctx.profile,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'profile' ? { ...input.msgClient, ...input.msgClient.c } : null,
      msg: input.msg?.t === 'profile' ? input.msg.c : null,
    }),

    LangBackend.update({
      deps: null,
      ctx: input.ctx,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'lang' ? { ...input.msgClient, ...input.msgClient.c } : null,
      msg: input.msg?.t === 'lang' ? input.msg.c : null,
    }),
  ])

  return {
    msgCmd: Msg.batch<BackendCmd<MsgToClient>>(
      BackendCmd.tag('spaces', space.msgCmd),
      BackendCmd.tag('auth', auth.msgCmd),
      BackendCmd.tag('wire', wire.msgCmd),
      BackendCmd.tag('profile', profile.msgCmd),
      BackendCmd.tag('lang', lang.msgCmd),
    ),
    msgEvt: Msg.batch<BackendEvt>(
      //
      auth.msgEvt,
      space.msgEvt,
      wire.msgEvt,
      profile.msgEvt,
      lang.msgEvt,
    ),
  }
}

//
//
//
// Subscriptions
//
//
//

const subscriptions = async (input: { ctx: BackendCtx }): Promise<Sub<MsgBackend>> => {
  return Sub.batch([
    Sub.tag('spaces', await SpacesBackend.subscriptions({ ctx: input.ctx.space, deps: null })),
    Sub.tag('wire', WireBackend.subscriptions({ ctx: input.ctx.wire })),
    Sub.flat(
      Sub.map(input.ctx.transport.fromClient, ({ sessionId, clientId, msgs }) =>
        msgs.map((c): MsgBackend => ({ t: '→', sessionId, clientId, c })),
      ),
    ),
  ])
}

const rpc = (input: { ctx: BackendCtx }) => {
  return RPC.initBackend(rpcContract, {
    wire: WireBackend.rpc({ ctx: input.ctx.wire }),
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

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
import { HttpServer } from '~/@/http-server'
import { DATABASE_URL } from '~/config/backend'
import { IS_PROD, HTTP_SERVER_IMPL } from '~/config/shared'
import { BackendCmd } from './@/backend/cmd'
import { AppBackendCtx } from './@/backend/ctx'
import { BackendEvt } from './@/backend/evt'
import { ProfileCache } from './@/backend/profile-cache'
import { BackendInstanceId } from './@/backend/backend-instance/backend-instance-id'
import * as AuthBackend from './auth/backend'
import * as LangBackend from './lang/backend'
import * as ProfileBackend from './profile/backend'
import { SpacesBackend } from './spaces/backend'
import {
  rpcContract,
  BackendCtx,
  type MsgBackend,
  type MsgToFrontend,
  type MsgToBackend,
  type MsgToBackendMeta,
} from './types'
import * as WireBackend from './wire/backend'
import { BackendTransport } from './wire/transport/backend'

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

  const USE_PGLIGHT = true

  const dbConnSql = USE_PGLIGHT
    ? await DbConnSql({
        t: 'pglite',
        filePath: './db/postgres-data',
        logger,
        simulateLatency,
      })
    : await DbConnSql({
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

  const httpServer = HttpServer({
    logger,
    t: HTTP_SERVER_IMPL,
  })

  const pubSub = await PubSubTopicBased({
    t: 'noop',
  })

  const transport = await BackendTransport<MsgToBackend, MsgToFrontend>(
    httpServer.t === 'bun'
      ? {
          t: 'bun-web-sockets',
          dbConnSql,
          httpServer: httpServer,
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
    httpServer,
    runtime,
    backendInstanceId: BackendInstanceId.generate(),
  }

  const wire = await WireBackend.initCtx({ ctx, transport })
  const profile = await ProfileBackend.initCtx({ ctx })
  const space = await SpacesBackend.initCtx({ ctx })
  const auth = await AuthBackend.initCtx({ ctx })

  return {
    ...ctx,
    httpServer,
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
    msgFrontend: input.msg.t === '→' ? { ...input.msg, ...input.msg.c } : null,
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
  msgCmd?: BackendCmd<MsgToFrontend> | null
}) => {
  const prefix = msg ? '[msg]' : msgEvt ? '[evt]' : '[cmd]'

  const obj = { ...msg, ...msgEvt, ...msgCmd }

  const sentMsgType =
    msgCmd?.c.t === 'send-to-frontend' || msgCmd?.c.t === 'send-to-user' || msgCmd?.c.t === 'broadcast'
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
    msgCmd: BackendCmd<MsgToFrontend>[]
  },
): Promise<{
  msgEvt: BackendEvt[]
  msgCmd: BackendCmd<MsgToFrontend>[]
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
  msgFrontend?: (MsgToBackend & MsgToBackendMeta) | null
  msgEvt?: BackendEvt | null
  msgCmd?: BackendCmd<MsgToFrontend> | null
}): Promise<{
  msgEvt: BackendEvt[]
  msgCmd: BackendCmd<MsgToFrontend>[]
}> => {
  const userId = await AuthBackend.getUserIdFromSessionId(input.ctx.auth, input.msgFrontend?.sessionId)

  const [space, auth, wire, profile, lang] = await Promise.all([
    SpacesBackend.update({
      deps: null,
      ctx: input.ctx.space,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgFrontend: input.msgFrontend?.t === 'spaces' ? { ...input.msgFrontend, ...input.msgFrontend.c, userId } : null,
      msg: input.msg?.t === 'spaces' ? input.msg.c : null,
    }),

    AuthBackend.update({
      deps: null,
      ctx: input.ctx.auth,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgFrontend: input.msgFrontend?.t === 'auth' ? { ...input.msgFrontend, ...input.msgFrontend.c, userId } : null,
      msg: input.msg?.t === 'auth' ? input.msg.c : null,
    }),

    WireBackend.update({
      ctx: input.ctx.wire,
      msgCmd: input.msgCmd?.t === 'wire' ? input.msgCmd : null,
      msgEvt: input.msgEvt,
      msgFrontend: input.msgFrontend?.t === 'wire' ? { ...input.msgFrontend, ...input.msgFrontend.c } : null,
      msg: input.msg?.t === 'wire' ? input.msg.c : null,
    }),

    ProfileBackend.update({
      deps: null,
      ctx: input.ctx.profile,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgFrontend: input.msgFrontend?.t === 'profile' ? { ...input.msgFrontend, ...input.msgFrontend.c } : null,
      msg: input.msg?.t === 'profile' ? input.msg.c : null,
    }),

    LangBackend.update({
      deps: null,
      ctx: input.ctx,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgFrontend: input.msgFrontend?.t === 'lang' ? { ...input.msgFrontend, ...input.msgFrontend.c } : null,
      msg: input.msg?.t === 'lang' ? input.msg.c : null,
    }),
  ])

  return {
    msgCmd: Msg.batch<BackendCmd<MsgToFrontend>>(
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
      Sub.map(input.ctx.transport.fromFrontend, ({ sessionId, clientId, msgs }) =>
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

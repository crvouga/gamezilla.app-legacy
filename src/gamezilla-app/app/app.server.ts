import { pipe, Posix, sleep, Sub, TimeSpan } from 'gamezilla-app/@/core'
import { Msg } from 'gamezilla-app/@/core/msg'
import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import { IServer, Server } from 'gamezilla-app/@/server'
import { ServerCmd, type AppServerCtx, type ServerEvt } from 'gamezilla-app/app/@/server'
import { DATABASE_URL } from 'gamezilla-app/config-private'
import { CODEBASE_VERSION_ID, IS_PROD, SERVER_IMPL } from 'gamezilla-app/config-public'
import { DbConnKv } from './@/server/db-conn-kv'
import { DbConnSql } from './@/server/db-conn-sql'
import { Logger } from './@/server/logger'
import { ILogger } from './@/server/logger/interface'
import { ProfileCache } from './@/server/profile-cache'
import { PubSubTopicBased } from './@/server/pub-sub-topic-based'
import { SMS } from './@/server/sms'
import type { MsgServer, MsgToClient, MsgToServer, MsgToServerMeta } from './app.types'
import { AuthTypes } from './auth'
import * as AuthServer from './auth/auth.server'
import * as LangServer from './lang/lang.server'
import * as ProfileServer from './profile/profile.server'
import * as SpaceServer from './spaces/server'
import { WireTypes } from './wire'
import * as WireServer from './wire/server'
import { ServerTransport, type IServerTransport } from './wire/transport/server'

//
//
//
//
//
//
//

export type Ctx = AppServerCtx & {
  transport: IServerTransport<{
    MsgToClient: MsgToClient
    MsgToServer: MsgToServer
  }>
  wire: WireTypes.ServerCtx<MsgToClient, MsgToServer>
  profile: ProfileServer.Deps
  space: SpaceServer.Deps
  auth: AuthTypes.ServerCtx
  server: IServer
}

export const initCtx = async (): Promise<Ctx> => {
  const logger = Logger({ t: 'console' })

  const simulateLatency = IS_PROD ? sleep : async () => sleep(TimeSpan.milliseconds(100 + Math.random() * 100))

  const dbConnSql = await DbConnSql({ t: 'postgres', databaseUrl: DATABASE_URL, logger, simulateLatency })

  const dbConnKv = await DbConnKv({ t: 'db-conn-sql', dbConnSql, logger })

  const sms = SMS({ t: 'twilio', logger })

  const server = Server({ logger, t: SERVER_IMPL })

  const pubSub = await PubSubTopicBased({ t: 'noop' })

  const transport = await ServerTransport<MsgToServer, MsgToClient>(
    server.t === 'bun'
      ? {
          t: 'bun-server-web-sockets',
          dbConnSql,
          codebaseVersionId: CODEBASE_VERSION_ID,
          server,
          logger,
          pubSubTopicBased: pubSub
        }
      : {
          t: 'socket-io',
          codebaseVersionId: CODEBASE_VERSION_ID,
          server,
          logger
        }
  )

  const profileCache = await ProfileCache({
    t: 'db-conn-kv',
    dbConnKv: await pipe(
      dbConnKv,
      async (dbConnKv) =>
        DbConnKv({
          t: 'with-throttled-writes',
          logger,
          dbConnKv,
          throttle: TimeSpan.seconds(10)
        }),
      async (dbConnKv) =>
        DbConnKv({
          t: 'with-cache',
          logger,
          source: await dbConnKv,
          cache: await DbConnKv({ t: 'hash-map', map: LRUCache({ maxCapacity: 100_000 }) })
        }),
      async (dbConnKv) =>
        DbConnKv({
          t: 'with-reduced-parsing',
          dbConnKv: await dbConnKv,
          logger,
          verifiedKeys: new Set()
        })
    )
  })

  const env = IS_PROD ? 'prod' : 'dev'

  const ctx: AppServerCtx = {
    env,
    sms,
    dbConnSql,
    dbConnKv,
    logger,
    now: Posix.now(),
    sleep,
    pubSub,
    profileCache
  }

  const wire = await WireServer.initCtx({ ctx, transport })
  const profile = await ProfileServer.initDeps({ ctx })
  const space = await SpaceServer.initDeps({ ctx })
  const auth = await AuthServer.initCtx({ ctx })

  return {
    ...ctx,
    server,
    auth,
    space,
    profile,
    wire,
    transport
  }
}

export const updateCtx = (ctx: Ctx): Ctx => {
  return {
    ...ctx,
    now: Posix.now()
  }
}

//
//
//
//
//
//
//

export const init = async (_input: { ctx: Ctx }): Promise<{}> => {
  return {}
}

//
//
//
//
//
//
//

export const update = async (input: { msg: MsgServer; ctx: Ctx }): Promise<{}> => {
  logMsg({ msg: input.msg, logger: input.ctx.logger })

  const updated = await updateChild({
    ctx: input.ctx,
    msg: input.msg,
    msgClient: input.msg.t === '→' ? { ...input.msg, ...input.msg.c } : null
  })

  await updateLoop(input.ctx, updated)

  return {}
}

const logMsg = ({
  msg,
  msgEvt,
  msgCmd,
  logger
}: {
  logger: ILogger
  msg?: MsgServer
  msgEvt?: ServerEvt
  msgCmd?: ServerCmd<MsgToClient>
}) => {
  const prefix = msg ? '[msg]' : msgEvt ? '[evt]' : '[cmd]'

  const obj = { ...msg, ...msgEvt, ...msgCmd }

  const sentMsgType =
    msgCmd?.c.t === 'send-to-client' || msgCmd?.c.t === 'send-to-user' || msgCmd?.c.t === 'broadcast'
      ? Msg.toMsgType(msgCmd.c.msg)
      : null

  const log = [prefix, Msg.toMsgType(obj)]

  if (sentMsgType) {
    log.push(`sent ${sentMsgType}`)
  }

  logger.info(log.join(' '))
}

const updateLoop = async (
  ctx: Ctx,
  acc: {
    msgEvt: ServerEvt[]
    msgCmd: ServerCmd<MsgToClient>[]
  }
): Promise<{
  msgEvt: ServerEvt[]
  msgCmd: ServerCmd<MsgToClient>[]
}> => {
  const [msgCmd, ...msgCmdRest] = acc.msgCmd

  if (msgCmd) {
    const updatedCmd = await updateChild({ ctx, msgCmd })

    logMsg({ msgCmd, logger: ctx.logger })

    return updateLoop(ctx, {
      msgCmd: Msg.batch(msgCmdRest, updatedCmd.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updatedCmd.msgEvt)
    })
  }

  const [msgEvt, ...msgEvtRest] = acc.msgEvt

  if (msgEvt) {
    const updatedEvent = await updateChild({ ctx, msgEvt })

    logMsg({ msgEvt, logger: ctx.logger })

    return updateLoop(ctx, {
      msgCmd: Msg.batch(msgCmdRest, updatedEvent.msgCmd),
      msgEvt: Msg.batch(msgEvtRest, updatedEvent.msgEvt)
    })
  }

  return acc
}

export const updateChild = async ({
  ctx,
  msg,
  msgClient,
  msgEvt,
  msgCmd
}: {
  ctx: Ctx
  msg?: MsgServer
  msgClient?: (MsgToServer & MsgToServerMeta) | null
  msgEvt?: ServerEvt
  msgCmd?: ServerCmd<MsgToClient>
}): Promise<{
  msgEvt: ServerEvt[]
  msgCmd: ServerCmd<MsgToClient>[]
}> => {
  const userId = await AuthServer.getUserIdFromSessionId(ctx.auth, msgClient?.sessionId)

  const space = await SpaceServer.update({
    deps: ctx.space,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient: msgClient?.t === 'spaces' ? { ...msgClient, ...msgClient.c, userId } : null,
    msg: msg?.t === 'spaces' ? msg.c : null
  })

  const auth = await AuthServer.update({
    deps: null,
    ctx: ctx.auth,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient: msgClient?.t === 'auth' ? { ...msgClient, ...msgClient.c, userId } : null,
    msg: msg?.t === 'auth' ? msg.c : null
  })

  const wire = await WireServer.update({
    ctx: ctx.wire,
    msgCmd: msgCmd?.t === 'wire' ? msgCmd : null,
    msgEvt: msgEvt,
    msgClient: msgClient?.t === 'wire' ? { ...msgClient, ...msgClient.c } : null,
    msg: msg?.t === 'wire' ? msg.c : null
  })

  const profile = await ProfileServer.update({
    deps: ctx.profile,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient: msgClient?.t === 'profile' ? { ...msgClient, ...msgClient.c } : null,
    msg: msg?.t === 'profile' ? msg.c : null
  })

  const lang = await LangServer.update({
    deps: null,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient: msgClient?.t === 'lang' ? { ...msgClient, ...msgClient.c } : null,
    msg: msg?.t === 'lang' ? msg.c : null
  })

  return {
    msgCmd: Msg.batch<ServerCmd<MsgToClient>>(
      ServerCmd.tag('spaces', space.msgCmd),
      ServerCmd.tag('auth', auth.msgCmd),
      ServerCmd.tag('wire', wire.msgCmd),
      ServerCmd.tag('profile', profile.msgCmd),
      ServerCmd.tag('lang', lang.msgCmd)
    ),
    msgEvt: Msg.batch<ServerEvt>(
      //
      auth.msgEvt,
      space.msgEvt,
      wire.msgEvt,
      profile.msgEvt,
      lang.msgEvt
    )
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = async (input: { ctx: Ctx }): Promise<Sub<MsgServer>> => {
  return Sub.batch([
    Sub.tag('spaces', await SpaceServer.subscriptions({ ctx: input.ctx, deps: input.ctx.space })),
    Sub.tag('wire', WireServer.subscriptions({ ctx: input.ctx.wire })),
    Sub.tag('lang', await LangServer.subscriptions({ ctx: input.ctx, deps: null })),
    Sub.flat(
      Sub.map(input.ctx.transport.toServer, ({ sessionId, clientId, msgs }) =>
        msgs.map((c): MsgServer => ({ t: '→', sessionId, clientId, c }))
      )
    )
  ])
}

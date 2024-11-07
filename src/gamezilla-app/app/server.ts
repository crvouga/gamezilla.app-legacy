import { pipe, Posix, sleep, Sub, TimeSpan } from 'gamezilla-app/@/core'
import { Msg } from 'gamezilla-app/@/core/msg'
import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import { Runtime } from 'gamezilla-app/@/runtime'
import { IWebServer, WebServer } from 'gamezilla-app/@/web-server'
import { ServerCmd, type AppServerCtx, type ServerEvt } from 'gamezilla-app/app/@/server'
import { DATABASE_URL } from 'gamezilla-app/config-private'
import { CODEBASE_VERSION_ID, IS_PROD, SERVER_IMPL } from 'gamezilla-app/config-public'
import { DbConnKv } from './@/server/db-conn-kv'
import { DbConnSql } from './@/server/db-conn-sql'
import { Logger } from './@/server/logger'
import { ILogger } from './@/server/logger/interface'
import { ProfileCache } from './@/server/profile-cache'
import { PubSubTopicBased } from './@/server/pub-sub-topic-based'
import { ServerInstanceId } from './@/server/server-instance/server-instance-id'
import { SMS } from './@/server/sms'
import { AuthTypes } from './auth'
import * as AuthServer from './auth/server'
import * as LangServer from './lang/server'
import * as ProfileServer from './profile/server'
import { ServerInstanceTypes } from './server-instance'
import * as ServerInstanceServer from './server-instance/server'
import * as SpaceServer from './spaces/server'
import type { MsgServer, MsgToClient, MsgToServer, MsgToServerMeta } from './types'
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
  profile: ProfileServer.ServerCtx
  space: SpaceServer.ServerCtx
  auth: AuthTypes.ServerCtx
  server: IWebServer
  serverInstance: ServerInstanceTypes.ServerCtx
}

export const initCtx = async (): Promise<Ctx> => {
  const logger = Logger({ t: 'console' })

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger
  })

  const simulateLatency = IS_PROD ? sleep : async () => sleep(TimeSpan.milliseconds(100 + Math.random() * 100))

  const dbConnSql = await DbConnSql({ t: 'postgres', databaseUrl: DATABASE_URL, logger, simulateLatency })

  const dbConnKv = await DbConnKv({ t: 'db-conn-sql', dbConnSql, logger })

  const sms = SMS({ t: 'twilio', logger })

  const server = WebServer({
    logger,
    t: SERVER_IMPL
  })

  const pubSub = await PubSubTopicBased({ t: 'noop' })

  const transport = await ServerTransport<MsgToServer, MsgToClient>(
    server.t === 'bun'
      ? {
          t: 'bun-web-sockets',
          dbConnSql,
          codebaseVersionId: CODEBASE_VERSION_ID,
          webServer: server,
          logger,
          pubSubTopicBased: pubSub
        }
      : {
          t: 'socket-io',
          codebaseVersionId: CODEBASE_VERSION_ID,
          webServer: server,
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
          throttle: TimeSpan.seconds(10),
          runtime
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
    profileCache,
    server,
    runtime,
    serverInstanceId: ServerInstanceId.generate()
  }

  const wire = await WireServer.initCtx({ ctx, transport })
  const profile = await ProfileServer.initDeps({ ctx })
  const space = await SpaceServer.initCtx({ ctx })
  const auth = await AuthServer.initCtx({ ctx })
  const serverInstance = await ServerInstanceServer.initCtx({ ctx })

  return {
    ...ctx,
    serverInstance,
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
  msg?: MsgServer | null
  msgEvt?: ServerEvt | null
  msgCmd?: ServerCmd<MsgToClient> | null
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

export const updateChild = async (input: {
  ctx: Ctx
  msg?: MsgServer | null
  msgClient?: (MsgToServer & MsgToServerMeta) | null
  msgEvt?: ServerEvt | null
  msgCmd?: ServerCmd<MsgToClient> | null
}): Promise<{
  msgEvt: ServerEvt[]
  msgCmd: ServerCmd<MsgToClient>[]
}> => {
  const userId = await AuthServer.getUserIdFromSessionId(input.ctx.auth, input.msgClient?.sessionId)

  const [space, auth, wire, profile, lang, _serverInstance] = await Promise.all([
    SpaceServer.update({
      deps: input.ctx.space,
      ctx: input.ctx,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'spaces' ? { ...input.msgClient, ...input.msgClient.c, userId } : null,
      msg: input.msg?.t === 'spaces' ? input.msg.c : null
    }),

    AuthServer.update({
      deps: null,
      ctx: input.ctx.auth,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'auth' ? { ...input.msgClient, ...input.msgClient.c, userId } : null,
      msg: input.msg?.t === 'auth' ? input.msg.c : null
    }),

    WireServer.update({
      ctx: input.ctx.wire,
      msgCmd: input.msgCmd?.t === 'wire' ? input.msgCmd : null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'wire' ? { ...input.msgClient, ...input.msgClient.c } : null,
      msg: input.msg?.t === 'wire' ? input.msg.c : null
    }),

    ProfileServer.update({
      deps: input.ctx.profile,
      ctx: input.ctx,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'profile' ? { ...input.msgClient, ...input.msgClient.c } : null,
      msg: input.msg?.t === 'profile' ? input.msg.c : null
    }),

    LangServer.update({
      deps: null,
      ctx: input.ctx,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'lang' ? { ...input.msgClient, ...input.msgClient.c } : null,
      msg: input.msg?.t === 'lang' ? input.msg.c : null
    }),

    ServerInstanceServer.update({
      ctx: input.ctx.serverInstance,
      deps: null,
      msg: input.msg?.t === 'server-instance' ? input.msg.c : null,
      msgClient: input.msgClient?.t === 'server-instance' ? { ...input.msgClient, ...input.msgClient.c } : null,
      msgCmd: null,
      msgEvt: input.msgEvt
    })
  ])

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
    Sub.tag('server-instance', await ServerInstanceServer.subscriptions({ ctx: input.ctx.serverInstance, deps: null })),
    Sub.flat(
      Sub.map(input.ctx.transport.toServer, ({ sessionId, clientId, msgs }) =>
        msgs.map((c): MsgServer => ({ t: '→', sessionId, clientId, c }))
      )
    )
  ])
}

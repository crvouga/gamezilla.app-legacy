import { Posix, Sub, TimeSpan, pipe } from 'gamezilla-app/@/core'
import { Msg } from 'gamezilla-app/@/core/msg'
import { LRUCache } from 'gamezilla-app/@/least-recently-used-cache'
import type { ServerInstance } from 'gamezilla-app/@/server'
import { ServerCmd, type ServerCtx, type ServerEvt } from 'gamezilla-app/app/@/server'
import { DbConnKv, type IDbConnKv } from './@/server/db-conn-kv'
import { DbConnSql, type IDbConnSql } from './@/server/db-conn-sql'
import { ILogger } from './@/server/logger/logger'
import { SMS, type ISMS } from './@/server/sms'
import type { MsgServer, MsgToClient, MsgToServer, MsgToServerMeta } from './app.types'
import * as AuthServer from './auth/auth.server'
import * as LangServer from './lang/lang.server'
import * as ProfileServer from './profile/profile.server'
import * as SpaceServer from './spaces/spaces.server'
import { ServerTransport, type IServerTransport } from './wire/transport-server'
import * as WireServer from './wire/wire.server'

//
//
//
//
//
//
//

export type Deps = {
  logger: ILogger
  dbConnSql: IDbConnSql
  dbConnKv: IDbConnKv
  sms: ISMS
  transport: IServerTransport<{
    MsgToClient: MsgToClient
    MsgToServer: MsgToServer
  }>
  wire: WireServer.Deps<MsgToClient, MsgToServer>
  profile: ProfileServer.Deps
  space: SpaceServer.Deps
  lang: LangServer.Deps
  auth: AuthServer.Deps
}

export const initDeps = async ({
  logger,
  server,
  codebaseVersionId
}: {
  codebaseVersionId: string
  logger: ILogger
  server: ServerInstance
}): Promise<Deps> => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL not set')
  }

  const dbConnSql = await DbConnSql({
    t: 'postgres',
    databaseUrl,
    logger: ILogger.prefix('db-conn-sql', logger)
  })

  const loggerDbConnKv = ILogger.prefix('db-conn-kv', logger)

  const dbConnKv = await pipe(
    DbConnKv({
      t: 'postgres',
      dbConnSql,
      logger: ILogger.prefix('postgres', loggerDbConnKv)
    }),

    async (dbConnKv) =>
      DbConnKv.withThrottledWrites({
        logger: ILogger.prefix('with-throttled-writes', loggerDbConnKv),
        dbConnKv: await dbConnKv,
        throttle: TimeSpan.seconds(5)
      }),

    async (dbConnKv) =>
      DbConnKv.withCache({
        logger: ILogger.prefix('with-cache', loggerDbConnKv),
        source: await dbConnKv,
        cache: await DbConnKv({
          t: 'hash-map',
          map: LRUCache({
            maxCapacity: 1000
          })
        })
      }),

    async (dbConnKv) =>
      DbConnKv.withReducedParsing({
        dbConnKv: await dbConnKv,
        verifiedKeys: new Set()
      })
  )

  const sms = SMS({
    t: 'twilio',
    logger: ILogger.prefix('twilio', logger)
  })

  const transport = await ServerTransport<MsgToServer, MsgToClient>({
    codebaseVersionId,
    server,
    logger: ILogger.prefix('transport', logger)
  })

  const wire = await WireServer.initDeps({
    transport,
    dbConnKv
  })

  const ctx: ServerCtx = {
    env: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    sms,
    dbConnSql,
    dbConnKv,
    logger,
    now: Posix.now()
  }

  const profile = await ProfileServer.initDeps({
    ctx
  })

  const space = await SpaceServer.initDeps({
    ctx
  })

  const auth = await AuthServer.initDeps({
    ctx
  })

  const lang = await LangServer.initDeps({
    ctx
  })

  return {
    lang,
    auth,
    space,
    profile,
    wire,
    transport,
    sms,
    logger,
    dbConnSql,
    dbConnKv
  }
}

export const initCtx = () => {
  return { now: Posix.now() }
}

//
//
//
// Model
//
//
//

export const init = async (input: { ctx: { now: Posix }; deps: Deps }): Promise<{}> => {
  const ctx: ServerCtx = {
    env: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    sms: input.deps.sms,
    dbConnSql: input.deps.dbConnSql,
    dbConnKv: input.deps.dbConnKv,
    logger: input.deps.logger,
    now: input.ctx.now
  }

  await WireServer.init()
  await SpaceServer.init({ ctx })
  await AuthServer.init({ ctx })
  await ProfileServer.init({ ctx })
  await LangServer.init({ ctx })

  return {}
}

//
//
//
// Update
//
//
//

export const update = async (input: { msg: MsgServer; ctx: { now: Posix }; deps: Deps }): Promise<{}> => {
  logMsg({ msg: input.msg, logger: input.deps.logger })

  const ctx: ServerCtx = {
    env: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    sms: input.deps.sms,
    dbConnSql: input.deps.dbConnSql,
    dbConnKv: input.deps.dbConnKv,
    logger: input.deps.logger,
    now: input.ctx.now
  }

  const updated = await updateChild({
    deps: input.deps,
    ctx: ctx,
    msg: input.msg,
    msgClient: input.msg.t === '→' ? { ...input.msg, ...input.msg.c } : null
  })

  await updateLoop(input.deps, ctx, updated)

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
    msgCmd?.c.t === 'send-to-client' ||
    msgCmd?.c.t === 'send-to-session' ||
    msgCmd?.c.t === 'send-to-user' ||
    msgCmd?.c.t === 'broadcast'
      ? Msg.toMsgType(msgCmd.c.msg)
      : null

  const log = [prefix, Msg.toMsgType(obj)]

  if (sentMsgType) {
    log.push(`sent ${sentMsgType}`)
  }

  logger.info(log.join(' '))
}

const updateLoop = async (
  deps: Deps,
  ctx: ServerCtx,
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
    const updatedCmd = await updateChild({ deps, ctx, msgCmd })

    logMsg({ msgCmd, logger: deps.logger })

    return updateLoop(deps, ctx, {
      msgCmd: Msg.batch(msgCmdRest, updatedCmd.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updatedCmd.msgEvt)
    })
  }

  const [msgEvt, ...msgEvtRest] = acc.msgEvt

  if (msgEvt) {
    const updatedEvent = await updateChild({ deps, ctx, msgEvt })

    logMsg({ msgEvt, logger: deps.logger })

    return updateLoop(deps, ctx, {
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
  msgCmd,
  deps
}: {
  deps: Deps
  ctx: ServerCtx
  msg?: MsgServer
  msgClient?: (MsgToServer & MsgToServerMeta) | null
  msgEvt?: ServerEvt
  msgCmd?: ServerCmd<MsgToClient>
}): Promise<{
  msgEvt: ServerEvt[]
  msgCmd: ServerCmd<MsgToClient>[]
}> => {
  const userId = msgClient?.sessionId ? await AuthServer.toUserIdFromSessionId(deps.auth, msgClient.sessionId) : null

  const space = await SpaceServer.update({
    deps: deps.space,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient: msgClient?.t === 'spaces' ? { ...msgClient, ...msgClient.c, userId } : null,
    msg: msg?.t === 'spaces' ? msg.c : null
  })

  const auth = await AuthServer.update({
    deps: deps.auth,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient: msgClient?.t === 'auth' ? { ...msgClient, ...msgClient.c, userId } : null,
    msg: msg?.t === 'auth' ? msg.c : null
  })

  const wire = await WireServer.update({
    model: null,
    ctx,
    msgCmd: msgCmd?.t === 'wire' ? msgCmd : null,
    msgEvt: msgEvt,
    msgClient: msgClient?.t === 'wire' ? { ...msgClient, ...msgClient.c } : null,
    msg: msg?.t === 'wire' ? msg.c : null,
    deps: deps.wire
  })

  const profile = await ProfileServer.update({
    deps: deps.profile,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient: msgClient?.t === 'profile' ? { ...msgClient, ...msgClient.c } : null,
    msg: msg?.t === 'profile' ? msg.c : null
  })

  const lang = await LangServer.update({
    deps: deps.lang,
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
    msgEvt: Msg.batch<ServerEvt>(auth.msgEvt, space.msgEvt, wire.msgEvt, profile.msgEvt, lang.msgEvt)
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = async (input: { deps: Deps; ctx: { now: Posix } }): Promise<Sub<MsgServer>> => {
  const ctx: ServerCtx = {
    env: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    dbConnSql: input.deps.dbConnSql,
    dbConnKv: input.deps.dbConnKv,
    logger: input.deps.logger,
    now: input.ctx.now,
    sms: input.deps.sms
  }
  return Sub.batch([
    Sub.tag('spaces', await SpaceServer.subscriptions({ ctx, deps: input.deps.space })),
    Sub.tag('wire', WireServer.subscriptions({ transport: input.deps.transport })),
    Sub.tag('lang', await LangServer.subscriptions({ ctx, deps: input.deps.lang })),
    Sub.flat(
      Sub.map(input.deps.transport.toServer, ({ sessionId, clientId, msgs }) =>
        msgs.map((c): MsgServer => ({ t: '→', sessionId, clientId, c }))
      )
    )
  ])
}

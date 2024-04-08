import {
  ServerCmd,
  ServerCtx,
  ServerEvent,
} from "gamezilla-app/@CHILD/app/@SHARED/server"
import {
  Eff,
  Posix,
  Sub,
  TimeSpan,
  batchMsgs,
  toMsgType,
} from "gamezilla-app/@SHARED/core"
import { ServerInstance } from "gamezilla-app/@SHARED/server"
import { CODEBASE_VERSION_ID } from "gamezilla-app/public-config"
import * as AuthServer from "./@CHILD/auth/auth.server"
import * as LangServer from "./@CHILD/lang/lang.server"
import * as ProfileServer from "./@CHILD/profile/profile.server"
import * as SpaceServer from "./@CHILD/spaces/spaces.server"
import {
  IServerTransport,
  ServerTransport,
} from "./@CHILD/wire/transport-server"
import * as WireServer from "./@CHILD/wire/wire.server"
import { DbConnKv, IDbConnKv } from "./@SHARED/server/db-conn-kv"
import { DbConnSql, IDbConnSql } from "./@SHARED/server/db-conn-sql"
import { Logger, loggerNoop } from "./@SHARED/server/logger"
import { ISMS, SMS } from "./@SHARED/server/sms"
import {
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
  MsgToServerMeta,
} from "./app.core"

//
//
//
//
//
//
//

export type Deps = {
  logger: Logger
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

export const getDeps = async ({
  logger,
  server,
}: {
  logger: Logger
  server: ServerInstance
}): Promise<Deps> => {
  const databaseUrl = process.env["DATABASE_URL"]

  if (!databaseUrl) {
    throw new Error(`[deps] DATABASE_URL not set`)
  }

  const dbConnSql = await DbConnSql({ databaseUrl, logger })

  const dbConnKv = IDbConnKv.withCache({
    writeDebounce: TimeSpan.fromSeconds(15),
    source: await DbConnKv({
      t: "postgres",
      logger: loggerNoop,
      dbConnSql,
    }),
    cache: await DbConnKv({
      t: "hash-map",
    }),
    logger,
  })

  const sms = SMS({ t: "twilio", logger })

  const transport = ServerTransport<MsgToServer, MsgToClient>({
    codebaseVersionId: CODEBASE_VERSION_ID,
    server,
  })

  const wire = await WireServer.getDeps({
    transport,
    dbConnKv,
  })

  const ctx: ServerCtx = {
    sms: sms,
    dbConnSql: dbConnSql,
    dbConnKv: dbConnKv,
    logger,
    now: Posix.now(),
  }

  const profile = await ProfileServer.getDeps({
    ctx,
  })

  const space = await SpaceServer.getDeps({
    ctx,
  })

  const auth = await AuthServer.getDeps({
    ctx,
  })

  const lang = await LangServer.getDeps({
    ctx,
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
    dbConnKv,
  }
}

export const getCtx = () => {
  return { now: Posix.now() }
}

//
//
//
// Model
//
//
//

export const init = async (input: {
  ctx: { now: Posix }
  deps: Deps
}): Promise<{
  model: ModelServer
  eff?: Eff<MsgServer>
}> => {
  const ctx: ServerCtx = {
    sms: input.deps.sms,
    dbConnSql: input.deps.dbConnSql,
    dbConnKv: input.deps.dbConnKv,
    logger: input.deps.logger,
    now: input.ctx.now,
  }

  const wire = await WireServer.init()

  const space = await SpaceServer.init({
    ctx,
    stored: null,
  })

  const auth = await AuthServer.init({
    ctx,
    stored: null,
  })

  const profile = await ProfileServer.init({
    ctx,
    stored: null,
  })

  const lang = await LangServer.init({
    ctx,
    stored: null,
  })

  return {
    model: null,
    eff: Eff.batch<MsgServer>([
      Eff.tag("auth", auth.eff),
      Eff.tag("profile", profile.eff),
      Eff.tag("lang", lang.eff),
      Eff.tag("wire", wire.eff),
      Eff.tag("spaces", space.eff),
    ]),
  }
}

//
//
//
// Update
//
//
//

export const update = async (input: {
  msg: MsgServer
  model: ModelServer
  ctx: { now: Posix }
  deps: Deps
}): Promise<{
  model: ModelServer
  eff?: Eff<MsgServer>
}> => {
  logMsg({ msg: input.msg, logger: input.deps.logger })

  const ctx: ServerCtx = {
    sms: input.deps.sms,
    dbConnSql: input.deps.dbConnSql,
    dbConnKv: input.deps.dbConnKv,
    logger: input.deps.logger,
    now: input.ctx.now,
  }

  const updatedFromMsg = await updateChild({
    deps: input.deps,
    ctx: ctx,
    model: input.model,
    msg: input.msg,
    msgClient: input.msg.t === "➡️" ? { ...input.msg, ...input.msg.c } : null,
  })

  const updated = await updateLoop(input.deps, ctx, updatedFromMsg)

  return {
    model: updated.model,
    eff: updated.eff,
  }
}

const logMsg = ({
  msg,
  msgEvt,
  msgCmd,
  logger,
}: {
  logger: Logger
  msg?: MsgServer
  msgEvt?: ServerEvent
  msgCmd?: ServerCmd<MsgToClient>
}) => {
  const prefix = msg ? "[msg]" : msgEvt ? "[evt]" : "[cmd]"

  const obj = { ...msg, ...msgEvt, ...msgCmd }

  const sentMsgType =
    msgCmd?.c.t === "send-to-client" ||
    msgCmd?.c.t === "send-to-session" ||
    msgCmd?.c.t === "send-to-user" ||
    msgCmd?.c.t === "broadcast"
      ? toMsgType(msgCmd.c.msg)
      : null

  const log = [prefix, toMsgType(obj)]

  if (sentMsgType) {
    log.push(`sent ${sentMsgType}`)
  }

  logger.info(log.join(" "))
}

type Output = {
  model: ModelServer
  eff: Eff<MsgServer>
  msgEvt: ServerEvent[]
  msgCmd: ServerCmd<MsgToClient>[]
}

const updateLoop = async (
  deps: Deps,
  ctx: ServerCtx,
  acc: Output,
): Promise<Output> => {
  const [msgCmd, ...msgCmdRest] = acc.msgCmd

  if (msgCmd) {
    const updatedCmd = await updateChild({
      deps,
      ctx,
      model: acc.model,
      msgCmd,
    })

    const accNew: Output = {
      model: updatedCmd.model,
      msgCmd: [...msgCmdRest, ...updatedCmd.msgCmd],
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
      msgEvt: batchMsgs(acc.msgEvt, updatedCmd.msgEvt),
    }

    logMsg({ msgCmd, logger: deps.logger })

    return updateLoop(deps, ctx, accNew)
  }

  const [msgEvt, ...msgEvtRest] = acc.msgEvt

  if (msgEvt) {
    const updatedEvent = await updateChild({
      deps,
      ctx,
      model: acc.model,
      msgEvt,
    })

    const accNew: Output = {
      model: updatedEvent.model,
      msgCmd: [...msgCmdRest, ...updatedEvent.msgCmd],
      eff: Eff.batch([acc.eff, updatedEvent.eff]),
      msgEvt: batchMsgs(msgEvtRest, updatedEvent.msgEvt),
    }

    logMsg({ msgEvt, logger: deps.logger })

    return updateLoop(deps, ctx, accNew)
  }

  return acc
}

export const updateChild = async ({
  ctx,
  msg,
  msgClient,
  msgEvt,
  msgCmd,
  model,
  deps,
}: {
  deps: Deps
  ctx: ServerCtx
  model: ModelServer
  msg?: MsgServer
  msgClient?: (MsgToServer & MsgToServerMeta) | null
  msgEvt?: ServerEvent
  msgCmd?: ServerCmd<MsgToClient>
}): Promise<Output> => {
  //
  //
  //
  //
  //

  const userId = msgClient?.sessionId
    ? await AuthServer.toUserIdFromSessionId(deps.auth, msgClient.sessionId)
    : null

  //
  //
  //
  //
  //

  const space = await SpaceServer.update({
    deps: deps.space,
    model: null,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient:
      msgClient?.t === "spaces"
        ? { ...msgClient, ...msgClient.c, userId }
        : null,
    msg: msg?.t === "spaces" ? msg.c : null,
  })

  const auth = await AuthServer.update({
    deps: deps.auth,
    model: null,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient:
      msgClient?.t === "auth" ? { ...msgClient, ...msgClient.c, userId } : null,
    msg: msg?.t === "auth" ? msg.c : null,
  })

  const wire = await WireServer.update({
    model: null,
    ctx,
    msgCmd: msgCmd?.t === "wire" ? msgCmd : null,
    msgEvt: msgEvt,
    msgClient:
      msgClient?.t === "wire" ? { ...msgClient, ...msgClient.c } : null,
    msg: msg?.t === "wire" ? msg.c : null,
    deps: deps.wire,
  })

  const profile = await ProfileServer.update({
    deps: deps.profile,
    model: null,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient:
      msgClient?.t === "profile" ? { ...msgClient, ...msgClient.c } : null,
    msg: msg?.t === "profile" ? msg.c : null,
  })

  const lang = await LangServer.update({
    deps: deps.lang,
    model: null,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient:
      msgClient?.t === "lang" ? { ...msgClient, ...msgClient.c } : null,
    msg: msg?.t === "lang" ? msg.c : null,
  })

  //
  //
  //
  //

  return {
    model,
    msgCmd: batchMsgs<ServerCmd<MsgToClient>>(
      ServerCmd.tag("spaces", space.msgCmd),
      ServerCmd.tag("auth", auth.msgCmd),
      ServerCmd.tag("wire", wire.msgCmd),
      ServerCmd.tag("profile", profile.msgCmd),
      ServerCmd.tag("lang", lang.msgCmd),
    ),
    eff: Eff.batch<MsgServer>([
      Eff.tag("spaces", space.eff),
      Eff.tag("auth", auth.eff),
      Eff.tag("wire", wire.eff),
      Eff.tag("profile", profile.eff),
      Eff.tag("lang", lang.eff),
    ]),
    msgEvt: batchMsgs<ServerEvent>(
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

export const subscriptions = async (input: {
  deps: Deps
  model: ModelServer
  ctx: { now: Posix }
}): Promise<Sub<MsgServer>> => {
  const ctx: ServerCtx = {
    dbConnSql: input.deps.dbConnSql,
    dbConnKv: input.deps.dbConnKv,
    logger: input.deps.logger,
    now: input.ctx.now,
    sms: input.deps.sms,
  }
  return Sub.batch([
    Sub.tag(
      "spaces",
      await SpaceServer.subscriptions({
        model: null,
        ctx,
        deps: input.deps.space,
      }),
    ),
    Sub.tag(
      "wire",
      WireServer.subscriptions({ transport: input.deps.transport }),
    ),
    Sub.tag(
      "lang",
      await LangServer.subscriptions({
        model: null,
        ctx,
        deps: input.deps.lang,
      }),
    ),
    Sub.flat(
      Sub.map(input.deps.transport.toServer, ({ sessionId, clientId, msgs }) =>
        msgs.map(
          (msg: any): MsgServer => ({
            t: "➡️",
            sessionId,
            clientId,
            c: msg,
          }),
        ),
      ),
    ),
  ])
}

import {
  DbConnSql,
  SMS,
  ServerCmd,
  ServerCtx,
  ServerEvent,
} from "gamezilla-app/@CHILD/app/@SHARED/server"
import {
  Eff,
  Posix,
  Sub,
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
import { createDbConnSql } from "./@SHARED/server/db-conn-sql"
import { Logger } from "./@SHARED/server/logger"
import { createSMS } from "./@SHARED/server/sms"
import {
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
  MsgToServerMeta,
} from "./app.core"
import { DbConnKv, createDbConnKv } from "./@SHARED/server/db-conn-kv"

//
//
//
//
//
//
//

export type Deps = {
  logger: Logger
  dbConnSql: DbConnSql
  dbConnKv: DbConnKv
  sms: SMS
  transport: IServerTransport<{
    MsgToClient: MsgToClient
    MsgToServer: MsgToServer
  }>
  wire: WireServer.Deps<MsgToClient, MsgToServer>
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

  const dbConnSql = await createDbConnSql({ databaseUrl, logger })

  const redisUrl = process.env["REDIS_URL"]

  if (!redisUrl) {
    throw new Error(`[deps] REDIS_URL not set`)
  }

  const dbConnKv = await createDbConnKv({
    t: "redis",
    url: redisUrl,
    logger,
  })

  const sms = createSMS("twilio")

  const transport = ServerTransport<MsgToServer, MsgToClient>({
    codebaseVersionId: CODEBASE_VERSION_ID,
    server,
  })

  const wire = await WireServer.getDeps({
    transport,
    dbConnKv,
  })

  return {
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
    model: {
      spaces: space.model,
    },
    eff: Eff.batch<MsgServer>([
      Eff.tag("auth", auth.eff),
      Eff.tag("profile", profile.eff),
      Eff.tag("lang", lang.eff),
      Eff.tag("wire", wire.eff),
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
    ? await AuthServer.toUserIdFromSessionId(
        AuthServer.getDeps({ ctx }),
        msgClient.sessionId,
      )
    : null

  //
  //
  //
  //
  //

  const space = await SpaceServer.update({
    deps: SpaceServer.getDeps({ ctx }),
    model: model.spaces,
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
    deps: AuthServer.getDeps({ ctx }),
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
    deps: ProfileServer.getDeps({ ctx }),
    model: null,
    ctx,
    msgCmd: null,
    msgEvt: msgEvt,
    msgClient:
      msgClient?.t === "profile" ? { ...msgClient, ...msgClient.c } : null,
    msg: msg?.t === "profile" ? msg.c : null,
  })

  const lang = await LangServer.update({
    deps: LangServer.getDeps({ ctx }),
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
    model: {
      spaces: space.model,
    },
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
  }
  return Sub.batch([
    Sub.tag(
      "spaces",
      await SpaceServer.subscriptions({ model: input.model.spaces, ctx }),
    ),
    Sub.tag(
      "wire",
      WireServer.subscriptions({ transport: input.deps.transport }),
    ),
    Sub.tag("lang", await LangServer.subscriptions({ model: null, ctx })),
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

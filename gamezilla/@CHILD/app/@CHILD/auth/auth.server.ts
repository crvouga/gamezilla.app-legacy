import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server"
import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  ServerCmd,
  ServerCtx,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server"
import { Eff, Sub, isErr } from "gamezilla/@SHARED/core"
import * as AuthServerSMS from "./@CHILD/auth-sms/auth-sms.server"
import { SessionDb } from "./@SHARED/server/session-db"
import { ModelServer, MsgToClient, ServerModule } from "./auth.core"

const sessionDb = (ctx: ServerCtx) => {
  return SessionDb({ t: "postgres-with-cache", dbConn: ctx.dbConn })
}

//
//
//
// Model
//
//
//

export const init: ServerModule["init"] = async (input) => {
  const sms = await AuthServerSMS.init({ ...input, stored: null })

  return {
    model: {
      sms: sms.model,
    },
    eff: Eff.tag("sms", sms.eff),
    msgCmd: ServerCmd.tag("sms", sms.msgCmd),
    msgEvt: sms.msgEvt,
  }
}

//
//
//
// Update
//
//
//

export const update: ServerModule["update"] = async (input) => {
  return AppServerModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromClient({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateChild({ ...input, model }),
  )
}

export const toUserIdFromSessionId = async (
  ctx: ServerCtx,
  _model: ModelServer,
  sessionId: SessionId,
): Promise<UserId | null> => {
  const found = await sessionDb(ctx).findUserIdBySessionId(sessionId)
  if (isErr(found)) {
    return null
  }
  const userId = found.value
  return userId
}

const updateChild: ServerModule["update"] = async (input) => {
  const sms = await AuthServerSMS.update({
    ctx: input.ctx,
    model: input.model.sms,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgClient:
      input.msgClient?.t === "sms"
        ? { ...input.msgClient, ...input.msgClient.c }
        : null,
    msg: input.msg?.t === "sms" ? input.msg.c : null,
  })

  return {
    model: {
      ...input.model,
      sms: sms.model,
    },
    eff: Eff.tag("sms", sms.eff),
    msgCmd: ServerCmd.tag("sms", sms.msgCmd),
    msgEvt: sms.msgEvt,
  }
}

const updateFromMsg: ServerModule["update"] = async ({ model }) => {
  return { model }
}

const updateFromClient: ServerModule["update"] = async ({
  model,
  msgClient,
  ctx,
}) => {
  switch (msgClient?.t) {
    case "logout": {
      const zapped = await sessionDb(ctx).zapBySessionId(msgClient.sessionId)

      if (zapped.t === "err") {
        return { model }
      }

      return {
        model,
        msgEvt: [
          {
            t: "auth/client-unauthenticated",
            clientId: msgClient.clientId,
            sessionId: msgClient.sessionId,
          },
        ],
      }
    }

    default: {
      return { model }
    }
  }
}

const updateFromEvent: typeof update = async ({ msgEvt, model, ctx }) => {
  if (!msgEvt) {
    return { model }
  }

  switch (msgEvt.t) {
    case "wire/client-connected": {
      const found = await sessionDb(ctx).findUserIdBySessionId(msgEvt.sessionId)

      if (isErr(found)) {
        return { model }
      }

      const userId = found.value

      if (!userId) {
        return {
          model: model,
          msgEvt: [
            {
              t: "auth/client-unauthenticated",
              clientId: msgEvt.clientId,
              sessionId: msgEvt.sessionId,
            },
          ],
        }
      }

      return {
        model: model,
        msgEvt: [
          {
            clientId: msgEvt.clientId,
            sessionId: msgEvt.sessionId,
            userId,
            t: "auth/client-authenticated",
          },
        ],
      }
    }

    case "auth/client-unauthenticated": {
      return {
        model,
        msgCmd: [
          sendToClient([msgEvt.clientId], {
            t: "client-unauthenticated",
            sessionId: msgEvt.sessionId,
          }),
        ],
      }
    }

    case "auth/client-authenticated": {
      const msgCmd = sendToClient<MsgToClient>([msgEvt.clientId], {
        t: "client-authenticated",
        userId: msgEvt.userId,
        loggedIn: true,
      })

      if (!msgEvt.loggedIn) {
        return {
          model,
          msgCmd: [msgCmd],
        }
      }

      const inserted = await sessionDb(ctx).insert({
        sessionId: msgEvt.sessionId,
        userId: msgEvt.userId,
      })

      if (isErr(inserted)) {
        return { model }
      }

      return {
        model,
        msgCmd: [msgCmd],
      }
    }

    default: {
      return { model }
    }
  }
}

//
//
//
//
//
//
//
//

export const subscriptions: ServerModule["subscriptions"] = async (input) => {
  return Sub.batch([
    Sub.tag(
      "sms",
      await AuthServerSMS.subscriptions({
        ...input,
        model: input.model.sms,
      }),
    ),
  ])
}

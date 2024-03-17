import { AppServerModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-server"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import {
  ServerCmd,
  ServerCtx,
  ServerEvent,
  sendToClient,
} from "gamezilla-app/@CHILD/app/@SHARED/server"
import {
  PhoneNumber,
  Posix,
  Result,
  Sub,
  isErr,
  ok,
} from "gamezilla-app/@SHARED/core"
import { IAccountDb } from "../../@SHARED/server/account-db"
import { AccountDb } from "../../@SHARED/server/account-db/account-db-impl"
import { MsgServer, MsgToClient, MsgToServer } from "./auth-sms.core"
import { IVerifySMS } from "./server/verify-sms/verify-sms"
import { VerifySMS } from "./server/verify-sms/verify-sms-impl"
import { Account } from "gamezilla-app/@CHILD/app/@SHARED/data/account"

//
//
//
//
//
//

type Module = AppServerModule<{
  Ctx: ServerCtx
  MsgInCmd: null
  MsgInEvent: ServerEvent
  Model: null
  Msg: MsgServer
  MsgOutCmd: ServerCmd<MsgToClient>
  MsgOutEvent: ServerEvent
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Deps: {
    AccountDb: IAccountDb
    VerifySMS: IVerifySMS
  }
}>

//
//
//
//
//
//

export const getDeps: Module["getDeps"] = ({ ctx }) => {
  return {
    AccountDb: AccountDb({
      t: "postgres",
      dbConnSql: ctx.dbConnSql,
    }),
    VerifySMS: VerifySMS({
      t: "fake",
      delay: () => new Promise((resolve) => setTimeout(resolve, 1000)),
      logger: ctx.logger,
    }),
  }
}

//
//
//
//
//
//

export const init: Module["init"] = async () => {
  return {
    model: null,
  }
}

//
//
//
//
//
//
//

export const update: Module["update"] = async (input) => {
  return AppServerModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromClient({ ...input, model }),
  )
}

const updateFromMsg: Module["update"] = async ({ msg, model, deps, ctx }) => {
  if (!msg) {
    return { model }
  }

  switch (msg.t) {
    case "verified-code": {
      if (isErr(msg.result)) {
        return {
          model,
          msgCmd: [sendToClient([msg.clientId], msg)],
        }
      }

      const found = await findElseInsertAccount({
        accountDb: deps.AccountDb,
        phoneNumber: msg.phoneNumber,
        now: ctx.now,
      })

      if (found.t === "err") {
        return {
          model,
          msgCmd: [sendToClient([msg.clientId], msg)],
        }
      }

      return {
        model,
        msgCmd: [sendToClient([msg.clientId], msg)],
        msgEvt: [
          {
            t: "auth/client-authenticated",
            clientId: msg.clientId,
            sessionId: msg.sessionId,
            account: found.value,
            loggedIn: true,
          },
        ],
      }
    }

    case "sent-code": {
      return {
        model,
        msgCmd: [sendToClient([msg.clientId], msg)],
      }
    }
  }
}

export const updateFromClient: Module["update"] = async ({
  msgClient,
  model,

  deps,
}) => {
  if (!msgClient) {
    return { model }
  }

  switch (msgClient.t) {
    case "send-code": {
      return {
        model,
        eff: async (dispatch) => {
          dispatch({
            t: "sent-code",
            phoneNumber: msgClient.phoneNumber,
            result: await deps.VerifySMS.sendCode(msgClient),
            clientId: msgClient.clientId,
          })
        },
      }
    }

    case "verify-code": {
      return {
        model,
        eff: async (dispatch) => {
          dispatch({
            t: "verified-code",
            phoneNumber: msgClient.phoneNumber,
            clientId: msgClient.clientId,
            result: await deps.VerifySMS.verifyCode(msgClient),
            sessionId: msgClient.sessionId,
          })
        },
      }
    }
  }
}

//
//
//
//
//
//

export const subscriptions: Module["subscriptions"] = async () => {
  return Sub.None
}

//
//
//
//
//
//
//
//
//

const findElseInsertAccount = async ({
  accountDb,
  phoneNumber,
  now,
}: {
  accountDb: IAccountDb
  phoneNumber: PhoneNumber
  now: Posix
}): Promise<Result<string, Account>> => {
  const found = await accountDb.findOneByPhoneNumber({ phoneNumber })

  if (isErr(found)) {
    return found
  }

  const maybeAccount = found.value

  if (maybeAccount) {
    return ok(maybeAccount)
  }

  const accountNew: Account = {
    role: "normal",
    userId: UserId.generate(),
    phoneNumber,
    createdAt: now,
  }

  const inserted = await accountDb.insert(accountNew)

  if (isErr(inserted)) {
    return inserted
  }

  return ok(accountNew)
}

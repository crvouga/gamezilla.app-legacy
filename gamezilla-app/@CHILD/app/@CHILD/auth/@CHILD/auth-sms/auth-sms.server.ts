import { AppServerModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-server"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { UserAccount } from "gamezilla-app/@CHILD/app/@SHARED/data/account"
import {
  ServerCmd,
  ServerCtx,
  ServerEvent,
  sendToClient,
} from "gamezilla-app/@CHILD/app/@SHARED/server"
import { Err, Ok, Posix, Result, Sub, isErr } from "gamezilla-app/@SHARED/core"
import { Hash, Hashing } from "gamezilla-app/@SHARED/hashing"
import { IAccountDb } from "../../@SHARED/server/account-db"
import { AccountDb } from "../../@SHARED/server/account-db/account-db-impl"
import { MsgServer, MsgToClient, MsgToServer } from "./auth-sms.core"
import { IVerifySMS } from "./verify-sms/verify-sms"
import { VerifySMS } from "./verify-sms/verify-sms-impl"

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

export const getDeps: Module["getDeps"] = async ({ ctx }) => {
  return {
    AccountDb: AccountDb({
      t: "postgres",
      dbConnSql: ctx.dbConnSql,
    }),
    VerifySMS: VerifySMS({
      t: "fake",
      delay: () => new Promise((resolve) => setTimeout(resolve, 1000)),
      logger: ctx.logger,
      hashing: Hashing({ t: "bun" }),
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
  return AppServerModule.andThen({ model: input.model }, (model) =>
    updateFromClient({ ...input, model }),
  )
}

export const updateFromClient: Module["update"] = async ({
  msgClient,
  model,
  deps,
  ctx,
}) => {
  if (!msgClient) {
    return { model }
  }

  switch (msgClient.t) {
    case "send-code": {
      const sent = await deps.VerifySMS.sendCode(msgClient)

      return {
        model,
        msgCmd: [
          sendToClient([msgClient.clientId], {
            t: "sent-code",
            phoneNumber: msgClient.phoneNumber,
            result: sent,
          }),
        ],
      }
    }

    case "verify-code": {
      const verified = await deps.VerifySMS.verifyCode({
        code: msgClient.code,
        verificationId: msgClient.verificationId,
      })

      if (isErr(verified)) {
        return {
          model,
          msgCmd: [
            sendToClient([msgClient.clientId], {
              t: "verified-code",
              result: verified,
            }),
          ],
        }
      }

      const found = await findElseInsertAccount({
        accountDb: deps.AccountDb,
        phoneNumberHash: verified.value.phoneNumberHash,
        now: ctx.now,
      })

      if (isErr(found)) {
        return {
          model,
          msgCmd: [
            sendToClient([msgClient.clientId], {
              t: "verified-code",
              result: Err({
                t: "database-error",
                error: found.error,
              }),
            }),
          ],
        }
      }

      return {
        model,
        msgCmd: [
          sendToClient([msgClient.clientId], {
            t: "verified-code",
            result: Result.mapOk(verified, () => null),
          }),
        ],
        msgEvt: [
          {
            t: "auth/client-authenticated",
            clientId: msgClient.clientId,
            sessionId: msgClient.sessionId,
            account: found.value,
            loggedIn: true,
          },
        ],
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
  phoneNumberHash,
  now,
}: {
  accountDb: IAccountDb
  phoneNumberHash: Hash
  now: Posix
}): Promise<Result<string, UserAccount>> => {
  const found = await accountDb.findOneByPhoneNumberHash({
    phoneNumberHash,
  })

  if (isErr(found)) {
    return found
  }

  const maybeAccount = found.value

  if (maybeAccount) {
    return Ok(maybeAccount)
  }

  const accountNew: UserAccount = {
    role: "normal",
    userId: UserId.generate(),
    createdAt: now,
  }

  const inserted = await accountDb.insert({
    account: accountNew,
    phoneNumberHash,
  })

  if (isErr(inserted)) {
    return inserted
  }

  return Ok(accountNew)
}

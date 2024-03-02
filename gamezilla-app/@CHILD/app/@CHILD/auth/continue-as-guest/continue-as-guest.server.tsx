import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { sendBack } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { isErr, notAsked, ok } from "gamezilla-app/@SHARED/core"
import { Account, ServerModule } from "../auth.core"
import { ModelClient } from "./continue-as-guest.core"

export const initModel: ModelClient = {
  guestRequest: notAsked,
}

export const update: ServerModule["update"] = async ({
  model,
  msgClient,
  deps,
  ctx,
}) => {
  switch (msgClient?.t) {
    case "guest.clicked-continue-as-guest-button": {
      const newGuestAccount: Account = {
        role: "guest",
        userId: UserId.generate(),
        createdAt: ctx.now,
      }

      const insertedAccount = await deps.AccountDb.insert(newGuestAccount)

      if (isErr(insertedAccount)) {
        return {
          model,
          msgCmd: [
            sendBack(msgClient, {
              t: "guest.continue-as-guest-result",
              result: insertedAccount,
            }),
          ],
        }
      }

      const insertedSession = await deps.SessionDb.insert({
        userId: newGuestAccount.userId,
        sessionId: msgClient.sessionId,
      })

      if (isErr(insertedSession)) {
        return {
          model,
          msgCmd: [
            sendBack(msgClient, {
              t: "guest.continue-as-guest-result",
              result: insertedSession,
            }),
          ],
        }
      }

      return {
        model,
        msgCmd: [
          sendBack(msgClient, {
            t: "guest.continue-as-guest-result",
            result: ok(newGuestAccount.userId),
          }),
        ],
        msgEvt: [
          {
            t: "auth/client-authenticated",
            clientId: msgClient.clientId,
            userId: newGuestAccount.userId,
            sessionId: msgClient.sessionId,
            loggedIn: true,
          },
        ],
      }
    }
  }

  return {
    model,
  }
}

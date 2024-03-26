import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Account } from "gamezilla-app/@CHILD/app/@SHARED/data/account"
import { sendBack } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { Ok, TimeSpan, isErr, notAsked } from "gamezilla-app/@SHARED/core"
import { ServerModule } from "../auth.core"
import { ModelClient } from "./continue-as-guest.core"

const initModel: ModelClient = {
  guestRequest: notAsked,
}

const update: ServerModule["update"] = async ({
  model,
  msgClient,
  deps,
  ctx,
}) => {
  switch (msgClient?.t) {
    case "guest.clicked-continue-as-guest-button": {
      await deps.timeout(TimeSpan.fromSeconds(1))

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
            result: Ok(newGuestAccount.userId),
          }),
        ],
        msgEvt: [
          {
            t: "auth/client-authenticated",
            clientId: msgClient.clientId,
            account: newGuestAccount,
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

export const ContinueAsGuestServer = {
  initModel,
  update,
}

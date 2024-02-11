import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { sendBack } from "gamezilla/@CHILD/app/@SHARED/server"
import { isErr, notAsked, ok } from "gamezilla/@SHARED/core"
import { Account, ServerModule } from "../auth.core"
import { ModelClient } from "./continue-as-guest.core"

export const initModel: ModelClient = {
  guestRequest: notAsked,
}

export const update: ServerModule["update"] = async ({
  model,
  msgClient,
  deps,
}) => {
  switch (msgClient?.t) {
    case "guest.clicked-continue-as-guest-button": {
      const newGuestAccount: Account = {
        userId: UserId.generate(),
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
      }
    }
  }

  return {
    model,
  }
}

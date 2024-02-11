import { sendToServer } from "gamezilla/@CHILD/app/@SHARED/client"
import { Button } from "gamezilla/@CHILD/app/@SHARED/ui"
import { RequestResponse, isRequesting, notAsked } from "gamezilla/@SHARED/core"
import { ClientModule } from "../auth.core"
import { ModelClient } from "./continue-as-guest.core"

export const initModel: ModelClient = {
  guestRequest: notAsked,
}

export const update: ClientModule["update"] = async ({
  ctx,
  model,
  msg,
  msgServer,
}) => {
  switch (msg?.t) {
    case "guest.clicked-continue-as-guest-button": {
      return {
        model: {
          ...model,
          guestRequest: RequestResponse.requesting(ctx.now),
        },
        msgCmd: [sendToServer({ t: "guest.clicked-continue-as-guest-button" })],
      }
    }
  }

  switch (msgServer?.t) {
    case "guest.continue-as-guest-result": {
      return {
        model: {
          ...model,
          guestRequest: RequestResponse.response(
            model.guestRequest,
            ctx.now,
            msgServer.result,
          ),
        },
      }
    }
  }

  return {
    model,
  }
}

export const ViewContinueAsGuestButton: ClientModule["View"] = ({
  dispatch,
  model,
}) => {
  return (
    <Button
      onClick={() => dispatch({ t: "guest.clicked-continue-as-guest-button" })}
      text="Continue as guest"
      loading={isRequesting(model.guestRequest)}
    />
  )
}

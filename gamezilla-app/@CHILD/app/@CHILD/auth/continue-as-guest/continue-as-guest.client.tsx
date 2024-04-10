import {
  APP_SOUND,
  playSound,
  sendToServer,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { Button, IconUserCircle } from "gamezilla-app/@CHILD/app/@SHARED/ui"
import {
  RequestResponse,
  isRequesting,
  notAsked,
} from "gamezilla-app/@SHARED/core"
import { ClientModule } from "../auth.core"
import { ModelClient } from "./continue-as-guest.core"

const initModel: ModelClient = {
  guestRequest: notAsked,
}

const update: ClientModule["update"] = ({ ctx, model, msg, msgServer }) => {
  switch (msg?.t) {
    case "guest.clicked-continue-as-guest-button": {
      return {
        model: {
          ...model,
          guestRequest: RequestResponse.requesting(ctx.now),
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToServer({ t: "guest.clicked-continue-as-guest-button" }),
        ],
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

const ViewButton: ClientModule["View"] = ({ dispatch, model, ctx }) => {
  return (
    <Button
      onClick={() => dispatch({ t: "guest.clicked-continue-as-guest-button" })}
      start={<IconUserCircle className="h-6 w-6" />}
      text={ctx.t("auth.continue-as-guest")}
      loading={isRequesting(model.guestRequest)}
    />
  )
}

export const ContinueAsGuestClient = {
  initModel,
  update,
  ViewButton,
}

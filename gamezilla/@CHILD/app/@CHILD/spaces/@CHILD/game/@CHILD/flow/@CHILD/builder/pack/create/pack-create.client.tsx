import {
  APP_SOUND,
  playSound,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client"
import { Button, IconPlus } from "gamezilla/@CHILD/app/@SHARED/ui"
import { loading, ok } from "gamezilla/@SHARED/core"
import { ClientModule } from "../../builder.core"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"

const update: ClientModule["update"] = (input) => {
  const { model, msg, msgGame, msgServer } = input

  switch (msg?.t) {
    case "pack-create.clicked-create-button": {
      return {
        model: {
          ...model,
          packCreateRequest: loading,
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToServer({
            t: "pack-create.clicked-create-button",
          }),
        ],
      }
    }
  }

  switch (msgServer?.t) {
    case "pack-create.created-pack": {
      return {
        model,
        msgGame: [
          withId({
            t: "user-created-pack",
            created: msgServer.created,
            userId: input.ctx.currentUserId,
          }),
        ],
      }
    }
  }

  switch (msgGame?.t) {
    case "user-created-pack": {
      return {
        model: {
          ...model,
          packCreateRequest: ok(null),
        },
        msgCmd: [playSound(APP_SOUND.refreshFeed)],
      }
    }
  }

  return { model }
}

const ViewCreateButton: ClientModule["View"] = (input) => {
  const { dispatch, model } = input

  return (
    <Button
      text="Create Pack"
      variant="contained"
      color="primary"
      loading={model.packCreateRequest.t === "loading"}
      start={<IconPlus className="h-8 w-8" />}
      onClick={() => dispatch({ t: "pack-create.clicked-create-button" })}
    />
  )
}

export const PackCreateClient = {
  update,
  ViewCreateButton,
}

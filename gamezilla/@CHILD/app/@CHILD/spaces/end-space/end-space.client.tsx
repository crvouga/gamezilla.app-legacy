import {
  APP_SOUND,
  playSound,
  pushRoute,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceClientModule } from "../architechure/space-client"
import { SpaceEvent, Spaces } from "../spaces-core"
import { Button } from "gamezilla/@CHILD/app/@SHARED/ui"
import { withId } from "../@SHARED/event"

const update: SpaceClientModule["update"] = async (input) => {
  return SpaceClientModule.chainUpdates(
    { model: input.model },
    (model) => updateEndSpaceButton({ ...input, model }),
    (model) => updateFromSpaceEvent({ ...input, model }),
  )
}

const updateFromSpaceEvent: SpaceClientModule["update"] = async (input) => {
  const { ctx, model, msgSpaceEvent } = input

  switch (msgSpaceEvent?.t) {
    case "user-ended-space": {
      if (!ctx.currentUserId) {
        return { model }
      }

      const currentUserSpaceId = Spaces.toSpaceIdByUserId(
        model,
        ctx.currentUserId,
      )

      if (msgSpaceEvent.spaceId !== currentUserSpaceId) {
        return { model }
      }

      return SpaceClientModule.chainUpdates(
        { model },
        (model) => {
          return {
            model,
            msgCmd: [playSound(APP_SOUND.navBackward)],
          }
        },
        (model) => {
          if (
            ctx.currentRoute.t === "spaces" &&
            ctx.currentRoute.c.t === "space" &&
            ctx.currentRoute.c.spaceId === msgSpaceEvent.spaceId
          ) {
            return {
              model,
              msgCmd: [
                pushRoute({
                  t: "spaces",
                  c: { t: "space-list" },
                }),
              ],
            }
          }
          return {
            model,
            msgCmd: [],
          }
        },
        (model) => {
          if (msgSpaceEvent.userId === ctx.currentUserId) {
            return {
              model,
              msgCmd: [showToast("Space ended")],
            }
          }

          const profile = ctx.profiles[msgSpaceEvent.userId]

          if (!profile) {
            return {
              model,
              msgCmd: [showToast("Space ended by host")],
            }
          }

          return {
            model,
            msgCmd: [showToast(`Space ended by ${profile.username}`)],
          }
        },
      )
    }

    default: {
      return { model }
    }
  }
}

const updateEndSpaceButton: SpaceClientModule["update"] = ({
  msg,
  model,
  ctx,
}) => {
  switch (msg?.t) {
    case "clicked-end-space-button": {
      if (!ctx.currentUserId) {
        return { model }
      }

      const currentUserSpaceId = Spaces.toSpaceIdByUserId(
        model,
        ctx.currentUserId,
      )

      if (!currentUserSpaceId) {
        return { model }
      }

      const spaceEventNew = withId<SpaceEvent>({
        t: "user-ended-space",
        spaceId: currentUserSpaceId,
        userId: ctx.currentUserId,
      })

      return {
        model,
        msgSpaceEvent: [spaceEventNew],
      }
    }
    default: {
      return { model }
    }
  }
}

export const ViewEndSpaceButton: SpaceClientModule["View"] = ({ dispatch }) => {
  return (
    <Button
      color="danger"
      variant="contained"
      size="sm"
      text="End"
      onClick={() => dispatch({ t: "clicked-end-space-button" })}
    />
  )
}

export const EndSpaceClient = {
  ViewEndSpaceButton,
  update,
}

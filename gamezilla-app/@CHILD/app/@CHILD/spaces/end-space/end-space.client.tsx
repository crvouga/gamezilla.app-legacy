import {
  APP_SOUND,
  playSound,
  pushRoute,
  showToast,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { Button } from "gamezilla-app/@CHILD/app/@SHARED/ui"
import { withId } from "../@SHARED/event"
import { SpacesRoutes } from "../@SHARED/space.routes"
import { SpaceClientModule } from "../architecture/architecture"
import { SpaceEvent, Spaces } from "../spaces-core"

const update: SpaceClientModule["update"] = async (input) => {
  return SpaceClientModule.andThen(
    { model: input.model },
    (model) => updateEndSpaceButton({ ...input, model }),
    (model) => updateFromSpaceEvent({ ...input, model }),
    (model) => updateFromAppEvent({ ...input, model }),
  )
}

const updateFromAppEvent: SpaceClientModule["update"] = async (input) => {
  const { ctx, model, msgEvt } = input

  switch (msgEvt?.t) {
    case "auth/unauthenticated": {
      const { currentUserId } = ctx
      const currentUserSpaceId = Spaces.toSpaceIdByUserId(model, currentUserId)
      if (!currentUserId || !currentUserSpaceId) {
        return { model }
      }

      return {
        model,
        msgSpaceEvent: [
          withId({
            t: "user-ended-space",
            spaceId: currentUserSpaceId,
            userId: currentUserId,
          }),
        ],
      }
    }

    default: {
      return { model }
    }
  }
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

      return SpaceClientModule.andThen(
        { model },
        (model) => {
          return {
            model,
            msgCmd: [playSound(APP_SOUND.navBackward)],
          }
        },
        (model) => {
          if (
            SpacesRoutes.Space.is(ctx.currentRouteV2) &&
            ctx.currentRouteV2.payload.spaceId === msgSpaceEvent.spaceId
          ) {
            return {
              model,
              msgCmd: [pushRoute(SpacesRoutes.SpaceList())],
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

const ViewSpaceEnded: SpaceClientModule["View"] = ({ dispatch }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">Space ended</p>
      <Button
        onClick={() => dispatch({ t: "clicked-go-home-button" })}
        size="lg"
        variant="contained"
        color="primary"
        text="Go Home"
      />
    </div>
  )
}

export const EndSpaceClient = {
  ViewSpaceEnded,
  ViewEndSpaceButton,
  update,
}

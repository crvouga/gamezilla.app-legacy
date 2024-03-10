import {
  APP_SOUND,
  playSound,
  showErrSm,
  showToast,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { Button, TopBar } from "gamezilla-app/@CHILD/app/@SHARED/ui"
import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "../@CHILD/game/@SHARED/game"
import { CoverArt } from "../@CHILD/game/game-cover-art"
import { gameNameToString } from "../@CHILD/game/game.core"
import { withId } from "../@SHARED/event"
import { SpaceClientModule } from "../architecture/architecture"
import { SpaceEvent, Spaces } from "../spaces-core"

const update: SpaceClientModule["update"] = (input) => {
  return SpaceClientModule.andThen(
    { model: input.model },
    (model) => updateFromSpaceEvent({ ...input, model }),
    (model) => updateFromJoinSpaceButton({ ...input, model }),
  )
}

const updateFromJoinSpaceButton: SpaceClientModule["update"] = ({
  msg,
  model,
  ctx,
}) => {
  switch (msg?.t) {
    case "clicked-join-space-button": {
      const currentUserId = ctx.currentUserId

      if (!currentUserId) {
        return { model }
      }

      const spaceEventNew = withId<SpaceEvent>({
        t: "user-joined-space",
        spaceId: msg.spaceId,
        userId: currentUserId,
      })

      return { model, msgSpaceEvent: [spaceEventNew] }
    }
    default: {
      return { model }
    }
  }
}

const updateFromSpaceEvent: SpaceClientModule["update"] = (input) => {
  const { msgSpaceEvent, model, ctx } = input

  if (!ctx.currentUserId) {
    return { model }
  }

  switch (msgSpaceEvent?.t) {
    case "user-joined-space": {
      const error = Spaces.toErrorByEvenId(model, msgSpaceEvent.eventId)

      switch (error?.t) {
        case "user-already-in-a-space": {
          if (error.userId === ctx.currentUserId) {
            return {
              model,
              msgCmd: showErrSm("You are already in a space"),
            }
          }

          return { model }
        }
      }

      const currentUserSpaceId = Spaces.toSpaceIdByUserId(
        model,
        ctx.currentUserId,
      )

      if (msgSpaceEvent.spaceId !== currentUserSpaceId) {
        return { model }
      }

      if (msgSpaceEvent.userId !== ctx.currentUserId) {
        const username = ctx.profiles[msgSpaceEvent.userId]?.username ?? null
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.navForward),
            showToast(username ? `${username} joined space` : "Joined space"),
          ],
        }
      }

      return {
        model,
        msgCmd: [playSound(APP_SOUND.navForward), showToast("Joined space")],
      }
    }

    default: {
      return { model }
    }
  }
}

const View: SpaceClientModule["View"] = (input) => {
  const { model, ctx, dispatch } = input
  const { currentUserId, space } = ctx

  if (!space || !currentUserId) {
    return null
  }

  const spaceState = Spaces.toSpaceState(model, space.spaceId)

  if (spaceState.type !== "started") {
    return null
  }

  const game = spaceState.game

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar title="Space" />

      <div className="flex w-full flex-1 flex-col overflow-y-scroll">
        <ViewGameHeader
          title={game ? gameNameToString(game.t) : null}
          renderCoverArt={
            game
              ? (props) => (
                  <div {...props}>
                    <CoverArt gameName={game.t} />
                  </div>
                )
              : undefined
          }
        />

        <ViewUsersInSpaceList
          ctx={{ ...ctx, currentUserId, space }}
          onOpenUserDetails={(userId) =>
            dispatch({ t: "clicked-user", userId })
          }
        />
      </div>

      <div className="flex flex-row gap-4 border-t border-neutral-600 p-4">
        <Button
          className="flex-1"
          onClick={() => {
            dispatch({ t: "clicked-go-home-button" })
          }}
          text="Go Home"
        />

        <Button
          className="flex-1"
          variant="contained"
          color="primary"
          onClick={() => {
            dispatch({ t: "clicked-join-space-button", spaceId: space.spaceId })
          }}
          text="Join space"
        />
      </div>
    </div>
  )
}

//
//
//
//
//
//
//

export const JoinSpaceClient = {
  View,
  update,
}

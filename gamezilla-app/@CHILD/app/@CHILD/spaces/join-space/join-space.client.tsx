import {
  APP_SOUND,
  playSound,
  replaceRoute,
  showErrSm,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import {
  Button,
  TopBar,
  TopBarBackButton,
} from "gamezilla-app/@CHILD/app/@SHARED/ui"
import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "../@CHILD/game/@SHARED/game"
import { CoverArt } from "../@CHILD/game/game-cover-art"
import { gameNameToString } from "../@CHILD/game/game.core"
import { withId } from "../@SHARED/event"
import { SpaceClientModule } from "../architecture/architecture"
import { SpaceEvent, Spaces } from "../spaces-core"
import { Feed } from "../feed/feed"

const update: SpaceClientModule["update"] = (input) => {
  return SpaceClientModule.chainUpdates(
    { model: input.model },
    (model) => updateBackButton({ ...input, model }),
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

      if (msgSpaceEvent.spaceId === currentUserSpaceId) {
        return {
          model,
          msgCmd: [playSound(APP_SOUND.navForward)],
        }
      }

      return { model }
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
      <TopBar left={<BackButton {...input} />} title="Space" />

      <Feed.View
        spaceState={spaceState}
        ctx={{
          ...ctx,
          currentUserId,
          space,
        }}
        model={model}
        dispatch={dispatch}
      />

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

      <div className="flex border-t border-neutral-600 p-4">
        <Button
          className="w-full"
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
//

const updateBackButton: SpaceClientModule["update"] = (input) => {
  const { msg, model } = input

  switch (msg?.t) {
    case "clicked-back-button": {
      switch (msg.from) {
        case "join-screen": {
          return {
            model,
            msgCmd: [
              replaceRoute({
                t: "spaces",
                c: { t: "space-list" },
              }),
            ],
          }
        }
      }
    }
    default: {
      return { model }
    }
  }
}

const BackButton: SpaceClientModule["View"] = ({ dispatch }) => {
  return (
    <TopBarBackButton
      onClick={() =>
        dispatch({ t: "clicked-back-button", from: "join-screen" })
      }
    />
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

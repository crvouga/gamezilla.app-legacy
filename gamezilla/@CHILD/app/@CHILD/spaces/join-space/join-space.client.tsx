import {
  APP_SOUND,
  playSound,
  replaceRoute,
  showErrSm,
} from "gamezilla/@CHILD/app/@SHARED/client"
import {
  Button,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "../@CHILD/game/@SHARED/game"
import { CoverArt } from "../@CHILD/game/game-cover-art"
import { gameNameToString } from "../@CHILD/game/game.core"
import { SpaceClientModule } from "../architechure/space-client"
import { Spaces } from "../spaces-core"
import { withId } from "../@SHARED/event"

const update: SpaceClientModule["update"] = (input) => {
  return SpaceClientModule.chainUpdates(
    { model: input.model },
    (model) => updateBackButton({ ...input, model }),
    (model) => updateFromSpaceEvent({ ...input, model }),
  )
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
  const { model, ctx } = input

  if (!ctx.space || !ctx.currentUserId) {
    return null
  }

  const space = Spaces.toSpaceState(model, ctx.space.spaceId)

  switch (space.type) {
    case "initial": {
      return <ViewSpaceInitial {...input} />
    }

    case "ended": {
      return <ViewSpaceEnded {...input} />
    }

    case "started": {
      return <ViewSpaceStarted {...input} />
    }
  }
}

const ViewHeader: SpaceClientModule["View"] = (input) => {
  return (
    <>
      <TopBar left={<BackButton {...input} />} title="Space" />
      {/* {false && (
        <ViewFeed
          ctx={ctx}
          dispatch={dispatch}
          model={model}
          spaceState={space}
        />
      )} */}
    </>
  )
}

const ViewSpaceStarted: SpaceClientModule["View"] = (input) => {
  const { model, ctx, dispatch } = input

  const currentUserId = ctx.currentUserId

  if (!ctx.space || !currentUserId) {
    return null
  }

  const space = Spaces.toSpaceState(model, ctx.space.spaceId)

  if (space.type !== "started") {
    return null
  }

  const game = space.game

  return (
    <div className="flex h-full w-full flex-col">
      <ViewHeader {...input} />

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
          ctx={{
            ...ctx,
            currentUserId,
            space,
            quit() {},
            viewProfile() {},
          }}
        />
      </div>

      <div className="flex border-t border-neutral-600 p-4">
        <Button
          className="w-full"
          variant="contained"
          color="primary"
          onClick={() => {
            dispatch({
              t: "event",
              c: withId({
                t: "user-joined-space",
                userId: currentUserId,
                spaceId: space.spaceId,
              }),
            })
          }}
          text="Join space"
        />
      </div>
    </div>
  )
}

const ViewSpaceInitial: SpaceClientModule["View"] = (input) => {
  return (
    <div className="flex h-full w-full flex-col">
      <ViewHeader {...input} />

      <div className="w-full flex-1 items-center justify-center">
        Space not found
      </div>
    </div>
  )
}

const ViewSpaceEnded: SpaceClientModule["View"] = (input) => {
  return (
    <div className="flex h-full w-full flex-col">
      <ViewHeader {...input} />

      <div className="w-full flex-1 items-center justify-center">
        Space not found
      </div>
    </div>
  )
}

//
//
//
// Back
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

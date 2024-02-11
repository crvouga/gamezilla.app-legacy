import {
  APP_SOUND,
  ClientCtx,
  playSound,
  pushRoute,
} from "gamezilla/@CHILD/app/@SHARED/client"
import { Avatar, IconXMark } from "gamezilla/@CHILD/app/@SHARED/ui"
import { CoverArt } from "../@CHILD/game/game-cover-art"
import { SpaceClientModule } from "../architechure/space-client"
import { Spaces } from "../spaces-core"
import { ModelClient, MsgClient } from "../spaces.core"

const update: SpaceClientModule["update"] = ({ model, msg, ctx }) => {
  switch (msg?.t) {
    case "clicked-current-space-bottom-bar": {
      const { currentUserId } = ctx
      const currentUsersSpaceId = Spaces.toSpaceIdByUserId(model, currentUserId)

      if (!currentUsersSpaceId) {
        return { model }
      }

      return {
        model,
        msgCmd: [
          playSound(APP_SOUND.navForwardMin),
          pushRoute({
            t: "spaces",
            c: { t: "space", spaceId: currentUsersSpaceId },
          }),
        ],
      }
    }

    default: {
      return { model }
    }
  }
}

const View = ({
  ctx,
  model,
  dispatch,
}: {
  ctx: ClientCtx
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  const userSpaceId = model.spaceIdByUserId[ctx.currentUserId]

  if (!userSpaceId) {
    return null
  }

  const space = Spaces.toSpaceStarted(model, userSpaceId)

  if (!space) {
    return null
  }

  const hostProfile = ctx.profiles[space.hostId]

  const userCount = Object.values(space.users).length

  return (
    <div className="flex w-full items-center overflow-hidden border-t-2 border-blue-600 text-inherit">
      <button
        className="flex flex-1 items-center overflow-hidden"
        onClick={() => dispatch({ t: "clicked-current-space-bottom-bar" })}
      >
        <div className="mr-2 p-2">
          {!space.game ? (
            <Avatar
              src={hostProfile?.avatarUrl}
              alt="Host Avatar"
              className="h-12 w-12"
            />
          ) : (
            <div className="h-12 w-12 overflow-hidden rounded border border-neutral-600">
              <CoverArt gameName={space.game.t} />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <p className="text-left">
            {hostProfile ? `${hostProfile.username}'s space` : "..."}
          </p>
          <p className="text-left text-xs text-neutral-300">
            {userCount} in space
          </p>
        </div>
      </button>

      {ctx.currentUserId === space.hostId && (
        <button
          aria-label="end space"
          onClick={() => dispatch({ t: "clicked-end-space-button" })}
          className="mr-4"
        >
          <IconXMark className="h-8 w-8" />
        </button>
      )}

      {ctx.currentUserId !== space.hostId && (
        <button
          aria-label="leave space"
          onClick={() => dispatch({ t: "clicked-leave-space-button" })}
          className="mr-4"
        >
          <IconXMark className="h-8 w-8" />
        </button>
      )}
    </div>
  )
}

export const CurrentSpaceBottomBar = {
  update,
  View,
}

import {
  APP_SOUND,
  ClientCtx,
  playSound,
  pushRoute,
} from "gamezilla-app/app/@SHARED/client"
import { Avatar, Button } from "gamezilla-app/app/@SHARED/ui"
import { CoverArt } from "../game/game-cover-art"
import { SpaceClientModule } from "../architecture/architecture"
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
            n: "spaces",
            t: "space",
            spaceId: currentUsersSpaceId,
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
    <div className="flex w-full flex-col items-center justify-center overflow-hidden text-inherit">
      <div className="h-1 w-full bg-gradient-to-tr from-blue-700  via-blue-600 to-sky-500"></div>
      <div className="flex w-full items-center overflow-hidden text-inherit">
        <button
          className="flex flex-1 items-center gap-3 overflow-hidden"
          onClick={() => dispatch({ t: "clicked-current-space-bottom-bar" })}
        >
          <div className="p-2">
            {!space.game ? (
              <Avatar
                src={hostProfile?.avatarUrl}
                alt="Host Avatar"
                className="h-14 w-14"
              />
            ) : (
              <div className="h-14 w-14 overflow-hidden rounded border border-neutral-700">
                <CoverArt gameName={space.game.t} />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-1 overflow-hidden py-3">
            <p className="truncate text-left text-lg">
              {hostProfile ? `${hostProfile.username}'s space` : "..."}
            </p>
            <p className="truncate text-left text-sm text-neutral-300">
              {userCount} in space
            </p>
          </div>
        </button>

        <div className="pr-4">
          {ctx.currentUserId === space.hostId && (
            <Button
              color="danger"
              text="End"
              onClick={() => dispatch({ t: "clicked-end-space-button" })}
              size="sm"
            />
          )}

          {ctx.currentUserId !== space.hostId && (
            <Button
              color="danger"
              text="Leave"
              onClick={() => dispatch({ t: "clicked-leave-space-button" })}
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export const CurrentSpaceBottomBar = {
  update,
  View,
}

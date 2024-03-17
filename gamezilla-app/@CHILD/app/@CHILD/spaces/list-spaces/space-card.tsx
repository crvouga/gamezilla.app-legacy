import { BaseClientCtx } from "gamezilla-app/@CHILD/app/@SHARED/client"
import { Avatar, cn } from "gamezilla-app/@CHILD/app/@SHARED/ui"
import { ViewSpaceHostChip, ViewYouChip } from "../@CHILD/game/@SHARED/game"
import { CoverArt } from "../@CHILD/game/game-cover-art"
import { gameNameToString } from "../@CHILD/game/game.core"
import { SpaceState } from "../spaces-core"

const MAX_AVATAR_COUNT = 3

export const ViewSpaceCard = ({
  ctx,
  state,
  onClick,
}: {
  ctx: BaseClientCtx
  state: SpaceState.Started
  onClick?: () => void
}) => {
  const host = ctx.profiles[state.hostId]
  const users = Object.values(state.users).flatMap((userId) => {
    const profile = ctx.profiles[userId]

    if (!profile) {
      return []
    }

    return [
      {
        username: profile.username,
        avatarUrl: profile.avatarUrl,
      },
    ]
  })

  const gameName = state.game?.t ?? null

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "flex flex-col gap-3 overflow-hidden rounded-md bg-gradient-to-tr from-blue-700  via-blue-600 to-sky-500 p-4",
        onClick && "hover:opacity-90 active:opacity-70",
      )}
    >
      <div className="flex w-full items-center justify-start">
        <p className="block flex-1 text-left font-bold uppercase">LIVE</p>
      </div>

      {gameName && (
        <div className="flex items-center justify-start gap-2">
          <div className="h-12 w-12 overflow-hidden rounded border-2 border-white/40">
            <CoverArt gameName={gameName} />
          </div>
          <p className="text-xl">{gameNameToString(gameName)}</p>
        </div>
      )}

      <div className="flex max-w-full items-center justify-start gap-2 overflow-hidden">
        <Avatar src={host?.avatarUrl} alt="avatar" className="h-12 w-12" />

        <div className="flex-1 overflow-hidden">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xl">
            {host?.username}
          </p>
        </div>
        <ViewSpaceHostChip ctx={ctx} />
        {ctx.currentUserId === host?.userId && <ViewYouChip ctx={ctx} />}
      </div>

      {users.length > 1 && (
        <div className="flex items-center justify-start gap-2">
          <div className="flex items-center">
            {users.slice(0, MAX_AVATAR_COUNT).map((user, index) => (
              <Avatar
                key={user.username}
                src={user.avatarUrl}
                alt="avatar"
                className={cn("h-8 w-8", index !== 0 && "-ml-2")}
              />
            ))}
            {users.length > MAX_AVATAR_COUNT && (
              <div className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/30">
                <p className="text-xs">
                  +{(users.length - MAX_AVATAR_COUNT).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <p className="text-lg">{users.length} people</p>
        </div>
      )}
    </button>
  )
}

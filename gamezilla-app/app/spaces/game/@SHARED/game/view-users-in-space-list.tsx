import {
  SpaceClientCtx,
  spaceToProfiles,
} from "gamezilla-app/app/spaces/@SHARED/space"
import { BaseClientCtx } from "gamezilla-app/app/@SHARED/client"
import { UserId } from "gamezilla-app/app/@SHARED/data"
import { Avatar, IconCrown } from "gamezilla-app/app/@SHARED/ui"

export const ViewUsersInSpaceList = ({
  ctx,
  onOpenUserDetails,
}: {
  ctx: SpaceClientCtx
  onOpenUserDetails: (userId: UserId) => void
}) => {
  const profiles = spaceToProfiles(ctx, ctx.space)
  return (
    <section className="flex w-full flex-col gap-2 py-4">
      <p className="text-center text-3xl font-bold">People</p>

      <div className="w-full">
        {profiles.map((profile) => {
          return (
            <button
              key={profile.userId}
              onClick={() => onOpenUserDetails(profile.userId)}
              className="flex w-full items-center gap-2 p-2 px-4 active:opacity-60"
            >
              <Avatar src={profile.avatarUrl} />
              <p>{profile.username}</p>
              {profile.userId === ctx.space.hostId && (
                <ViewSpaceHostChip ctx={ctx} />
              )}
              {profile.userId === ctx.currentUserId && (
                <ViewYouChip ctx={ctx} />
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export const ViewSpaceHostChip = (props: { ctx: BaseClientCtx }) => {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/20 px-2 py-1 text-xs font-semibold">
      <IconCrown className="h-4 w-4 text-yellow-300" />
      {props.ctx.t("host")}
    </div>
  )
}

export const ViewYouChip = (props: { ctx: BaseClientCtx }) => {
  return (
    <div className="rounded-xl border border-white/20 bg-white/20 px-2 py-1 text-xs">
      {props.ctx.t("you")}
    </div>
  )
}

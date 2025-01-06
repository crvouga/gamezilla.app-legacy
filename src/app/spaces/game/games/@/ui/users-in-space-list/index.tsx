import type { UserId } from '~/app/@/data/user-id'
import { Avatar, Typography } from '~/app/@/ui'
import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { ViewHostChip } from './host-chip'
import { ViewYouChip } from './you-chip'

export const ViewUsersInSpaceList = ({
  ctx,
  onOpenUserDetails,
}: {
  ctx: SpaceClientCtx
  onOpenUserDetails: (userId: UserId) => void
}) => {
  const profiles = SpaceClientCtx.toProfiles(ctx)
  return (
    <section className='flex w-full flex-col gap-3 py-4'>
      <Typography variant='title' className='px-4' text={ctx.t('app.people')} />

      <div className='w-full'>
        {profiles.map((profile) => {
          return (
            <button
              key={profile.userId}
              onClick={() => onOpenUserDetails(profile.userId)}
              className='flex w-full items-center gap-2 p-2 px-4 active:opacity-60'
            >
              <Avatar src={profile.avatarUrl} />
              <p>{profile.username}</p>
              {profile.userId === ctx.space.hostId && <ViewHostChip ctx={ctx} />}
              {profile.userId === ctx.currentUserId && <ViewYouChip ctx={ctx} />}
            </button>
          )
        })}
      </div>
    </section>
  )
}

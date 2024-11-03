import type { BaseClientCtx } from 'gamezilla-app/app/@/client'
import type { UserId } from 'gamezilla-app/app/@/data'
import { Avatar, IconCrown, Typography } from 'gamezilla-app/app/@/ui'
import { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space-client-ctx'

export const ViewUsersInSpaceList = ({
  ctx,
  onOpenUserDetails
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
              {profile.userId === ctx.space.hostId && <ViewSpaceHostChip ctx={ctx} />}
              {profile.userId === ctx.currentUserId && <ViewYouChip ctx={ctx} />}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export const ViewSpaceHostChip = (input: { ctx: BaseClientCtx }) => {
  return (
    <div className='flex items-center gap-1 rounded-xl border border-white/20 bg-white/20 px-2 py-1 text-xs font-semibold'>
      <IconCrown className='h-4 w-4 text-yellow-300' />
      {input.ctx.t('host')}
    </div>
  )
}

export const ViewYouChip = (input: { ctx: BaseClientCtx }) => {
  return <div className='rounded-xl border border-white/20 bg-white/20 px-2 py-1 text-xs'>{input.ctx.t('you')}</div>
}

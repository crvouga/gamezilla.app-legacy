import type { UserId } from '~/app/@/data/user-id'
import { Avatar, Typography } from '~/@/ui'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from './host-chip'
import { ViewYouChip } from './you-chip'

export const SectionPeopleList = ({
  ctx,
  onOpenUserDetails,
}: {
  ctx: SpaceFrontendCtx
  onOpenUserDetails: (userId: UserId) => void
}) => {
  const profiles = SpaceFrontendCtx.toProfiles(ctx)
  return (
    <section className='flex w-full flex-col gap-3 overflow-hidden py-6'>
      <Typography variant='title' className='px-6' text={ctx.t('app.people')} />

      <div className='w-full'>
        {profiles.map((profile) => (
          <PeopleListItem
            key={profile.userId}
            profile={profile}
            ctx={ctx}
            onClick={() => onOpenUserDetails(profile.userId)}
          />
        ))}
      </div>
    </section>
  )
}

const PeopleListItem = ({
  profile,
  ctx,
  onClick,
}: {
  profile: ReturnType<typeof SpaceFrontendCtx.toProfiles>[number]
  ctx: SpaceFrontendCtx
  onClick: () => void
}) => {
  return (
    <button key={profile.userId} onClick={onClick} className='clickable flex w-full items-center gap-2 p-2 px-6'>
      <Avatar className='size-12' src={profile.avatarUrl} />
      <p>{profile.username}</p>
      {profile.userId === ctx.space.hostId && <ViewHostChip ctx={ctx} />}
      {profile.userId === ctx.currentUserId && <ViewYouChip ctx={ctx} />}
    </button>
  )
}

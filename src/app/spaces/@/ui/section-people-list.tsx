import { Avatar } from '~/@/ui'
import type { UserId } from '~/app/@/data/user-id'
import { SectionTitle } from '~/app/@/ui/section/section-title'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from '~/app/spaces/@/ui/host-chip'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'

export const SectionPeopleList = (input: {
  ctx: SpaceFrontendCtx
  onOpenUserDetails: (userId: UserId) => void
  title?: string
}) => {
  const profiles = SpaceFrontendCtx.toProfiles(input.ctx)
  return (
    <section className='flex w-full flex-col gap-3 overflow-hidden py-6'>
      <SectionTitle text={input.ctx.t('app.people')} />

      <div className='w-full'>
        {profiles.map((profile) => (
          <PersonListItem
            key={profile.userId}
            profile={profile}
            ctx={input.ctx}
            onClick={() => input.onOpenUserDetails(profile.userId)}
          />
        ))}
      </div>
    </section>
  )
}

const PersonListItem = (input: {
  profile: ReturnType<typeof SpaceFrontendCtx.toProfiles>[number]
  ctx: SpaceFrontendCtx
  onClick: () => void
}) => {
  return (
    <button
      key={input.profile.userId}
      onClick={input.onClick}
      className='clickable flex w-full items-center gap-2 p-2 px-6'
    >
      <Avatar className='size-12' src={input.profile.avatarUrl} />
      <p>{input.profile.username}</p>
      {input.profile.userId === input.ctx.space.hostId && <ViewHostChip ctx={input.ctx} />}
      {input.profile.userId === input.ctx.currentUserId && <ViewYouChip ctx={input.ctx} />}
    </button>
  )
}

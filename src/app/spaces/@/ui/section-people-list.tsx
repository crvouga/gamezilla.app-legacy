import { Avatar } from '~/@/ui'
import { Frag } from '~/@/ui/frag'
import { VDom } from '~/@/vdom/vdom'
import { Profile } from '~/app/@/data/profile'
import type { UserId } from '~/app/@/data/user-id'
import { SectionTitle } from '~/app/@/ui/section/section-title'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from '~/app/spaces/@/ui/host-chip'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'

export const SectionPeopleList = (input: {
  ctx: SpaceFrontendCtx
  onClickItem: (userId: UserId) => void
  renderItem?: (profile: Profile, vDom: VDom) => VDom
  title?: string
}) => {
  const profiles = SpaceFrontendCtx.toProfiles(input.ctx)

  const renderItem = input.renderItem ?? ((_profile, vDom) => vDom)

  return (
    <section className='flex w-full flex-col gap-3 py-6'>
      <SectionTitle text={input.ctx.t('app.people')} />

      <div className='flex w-full flex-col'>
        {profiles.map((profile) => (
          <Frag key={profile.userId}>
            {renderItem(
              profile,
              <PersonListItem
                key={profile.userId}
                profile={profile}
                ctx={input.ctx}
                onClick={() => input.onClickItem(profile.userId)}
              />,
            )}
          </Frag>
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
      {input.profile.userId === input.ctx.currentUser.userId && <ViewYouChip ctx={input.ctx} />}
    </button>
  )
}

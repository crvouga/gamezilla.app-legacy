import { Avatar } from '~/@/ui/avatar'
import { Clickable } from '~/@/ui/clickable'
import { Frag } from '~/@/ui/frag'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import type { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { SectionTitle } from '~/app/@/ui/section/section-title'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from '~/app/spaces/@/ui/host-chip'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'

export const SectionPeopleList = (input: {
  ctx: SpaceFrontendCtx
  onClickItem: (userId: UserId) => void
  renderItem?: (profile: UserProfile, vDom: VDom) => VDom
  title?: string
}) => {
  const profiles = SpaceFrontendCtx.toProfiles(input.ctx)

  const renderItem = input.renderItem ?? ((_profile, vDom) => vDom)

  return h('section', { className: 'flex w-full flex-col gap-3 py-6' }, [
    h(SectionTitle, { text: input.ctx.t('app.people') }),
    h('div', { className: 'flex w-full flex-col' }, [
      profiles.map((profile) =>
        h(Frag, { key: profile.id }, [
          renderItem(
            profile,
            h(PersonListItem, {
              key: profile.id,
              profile: profile,
              ctx: input.ctx,
              onClick: () => input.onClickItem(profile.userId),
            }),
          ),
        ]),
      ),
    ]),
  ])
}

const PersonListItem = (input: {
  profile: ReturnType<typeof SpaceFrontendCtx.toProfiles>[number]
  ctx: SpaceFrontendCtx
  onClick: () => void
}) => {
  return h(
    Clickable,
    {
      key: input.profile.id,
      onClick: input.onClick,
      className: 'flex w-full items-center gap-2 p-2 px-6',
    },
    [
      h(Avatar, { className: 'size-12', src: UserProfile.toAvatarUrl(input.profile) }),
      h('p', {}, [input.profile.username]),
      input.profile.userId === input.ctx.space.hostId && h(ViewHostChip, { ctx: input.ctx }),
      input.profile.userId === input.ctx.currentUser.userId && h(ViewYouChip, { ctx: input.ctx }),
    ],
  )
}

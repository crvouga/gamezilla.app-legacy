import { Avatar } from '~/@/ui/avatar'
import { Box } from '~/@/vdom/primitives/box'
import { Clickable } from '~/@/ui/clickable'
import { Frag } from '~/@/vdom/primitives/frag'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import type { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { SectionTitle } from '~/app/@/ui/section/section-title'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from '~/app/spaces/@/ui/host-chip'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'
import { Text } from '~/@/vdom/primitives/text'

export const SectionPeopleList = (input: {
  ctx: SpaceFrontendCtx
  onPressItem: (userId: UserId) => void
  renderItem?: (profile: UserProfile, vDom: VDom) => VDom
  title?: string
}) => {
  const profiles = SpaceFrontendCtx.toProfiles(input.ctx)

  const renderItem = input.renderItem ?? ((_profile, vDom) => vDom)

  return h(Box, { class: 'flex w-full flex-col gap-3 py-6' }, [
    h(SectionTitle, { text: input.ctx.t('app.people') }),
    h(
      Box,
      { class: 'flex flex-row w-full flex-col' },
      profiles.map((profile) =>
        h(Frag, { key: profile.id }, [
          renderItem(
            profile,
            h(PersonListItem, {
              key: profile.id,
              profile: profile,
              ctx: input.ctx,
              onPress: () => input.onPressItem(profile.userId),
            }),
          ),
        ]),
      ),
    ),
  ])
}

const PersonListItem = (input: {
  key?: string
  profile: ReturnType<typeof SpaceFrontendCtx.toProfiles>[number]
  ctx: SpaceFrontendCtx
  onPress: () => void
}) => {
  return h(
    Clickable,
    {
      key: input.key,
      onPress: input.onPress,
      class: 'flex flex-row w-full items-center gap-2 p-2 px-6',
    },
    [
      h(Avatar, { class: 'size-12', src: UserProfile.toAvatarUrl(input.profile) }),
      h(Box, {}, [h(Text, { text: input.profile.username })]),
      input.profile.userId === input.ctx.space.hostId && h(ViewHostChip, { ctx: input.ctx }),
      input.profile.userId === input.ctx.currentUser.userId && h(ViewYouChip, { ctx: input.ctx }),
    ],
  )
}

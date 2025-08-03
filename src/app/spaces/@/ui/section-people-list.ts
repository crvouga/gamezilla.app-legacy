import { Avatar } from '~/@/ui/avatar'
import { Clickable } from '~/@/ui/clickable'
import { theme } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Frag } from '~/@/vdom/primitives/frag'
import { Text } from '~/@/vdom/primitives/text'
import { VDom } from '~/@/vdom/vdom'
import type { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { SectionTitle } from '~/app/@/ui/section/section-title'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from '~/app/spaces/@/ui/host-chip'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'

export const SectionPeopleList = (input: {
  ctx: SpaceFrontendCtx
  onPressItem: (userId: UserId) => void
  renderItem?: (profile: UserProfile, vDom: VDom) => VDom
  title?: string
}) => {
  const profiles = SpaceFrontendCtx.toProfiles(input.ctx)

  const renderItem = input.renderItem ?? ((_profile, vDom) => vDom)

  return h(Box, { style: theme({ flexDirection: 'col', width: 'full', gap: 3, padding: 6 }) }, [
    h(SectionTitle, { text: input.ctx.t('app.people') }),
    h(
      Box,
      { style: theme({ flexDirection: 'row', width: 'full' }) },
      profiles.map((profile) =>
        h(Frag, { key: profile.id }, [
          renderItem(
            profile,
            h(PersonMenuItem, {
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

const PersonMenuItem = (input: {
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
      style: theme({
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        px: 6,
      }),
    },
    [
      h(Avatar, { style: theme({ size: 12 }), src: UserProfile.toAvatarUrl(input.profile) }),
      h(Box, {}, [h(Text, { text: input.profile.username })]),
      input.profile.userId === input.ctx.space.hostId && h(ViewHostChip, { ctx: input.ctx }),
      input.profile.userId === input.ctx.currentUser.userId && h(ViewYouChip, { ctx: input.ctx }),
    ],
  )
}

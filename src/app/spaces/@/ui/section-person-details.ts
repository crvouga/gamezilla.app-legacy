import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { sx } from '~/@/vdom/style/sx'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { UserProfile } from '~/app/@/data/user-profile'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from '~/app/spaces/@/ui/host-chip'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'

export const SectionPersonDetails = (input: {
  ctx: SpaceFrontendCtx
  profile: UserProfile | null
  onOpenDetails: () => void
}) => {
  return h(Box, {}, [
    h(
      Pressable,
      {
        role: 'button',
        style: sx({
          flexDirection: 'col',
          width: 'full',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: 4,
        }),
        onPress: input.onOpenDetails,
      },
      [
        h(Avatar, { src: input.profile ? UserProfile.toAvatarUrl(input.profile) : '', style: sx({ size: 24 }) }),
        input.profile && h(Typography, { variant: 'title', text: input.ctx.t('username', input.profile?.username) }),
        h(Box, { style: sx({ flexDirection: 'row', alignItems: 'center', gap: 2 }) }, [
          input.ctx.space.hostId === input.profile?.userId && h(ViewHostChip, { ctx: input.ctx }),
          input.ctx.currentUser.userId === input.profile?.userId && h(ViewYouChip, { ctx: input.ctx }),
        ]),
      ],
    ),

    h(Box, { style: sx({ width: 'full', padding: 4, paddingBottom: 8 }) }, [
      h(Button, { onPress: input.onOpenDetails, width: 'full', text: input.ctx.t('app.see-profile') }),
    ]),
  ])
}

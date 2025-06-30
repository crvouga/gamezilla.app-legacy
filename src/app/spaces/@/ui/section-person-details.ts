import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { UserProfile } from '~/app/@/data/user-profile'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from '~/app/spaces/@/ui/host-chip'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'

export const SectionPersonDetails = (input: {
  ctx: SpaceFrontendCtx
  profile: UserProfile | null
  onOpenDetails: () => void
}) => {
  return h('div', null, [
    h(
      'button',
      {
        type: 'button',
        className: 'flex w-full flex-col items-center justify-center gap-2 p-4',
        onClick: input.onOpenDetails,
      },
      [
        h(Avatar, { src: input.profile ? UserProfile.toAvatarUrl(input.profile) : '', className: 'size-24' }),
        input.profile && h(Typography, { variant: 'title', text: input.ctx.t('username', input.profile?.username) }),
        h('div', { className: 'flex items-center gap-2' }, [
          input.ctx.space.hostId === input.profile?.userId && h(ViewHostChip, { ctx: input.ctx }),
          input.ctx.currentUser.userId === input.profile?.userId && h(ViewYouChip, { ctx: input.ctx }),
        ]),
      ],
    ),

    h('div', { className: 'w-full px-4 pb-8' }, [
      h(Button, { onClick: input.onOpenDetails, className: 'w-full', text: input.ctx.t('spaces.see-profile') }),
    ]),
  ])
}

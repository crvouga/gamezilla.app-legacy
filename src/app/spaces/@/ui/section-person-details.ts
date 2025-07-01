import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'
import { UserProfile } from '~/app/@/data/user-profile'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from '~/app/spaces/@/ui/host-chip'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'

export const SectionPersonDetails = (input: {
  ctx: SpaceFrontendCtx
  profile: UserProfile | null
  onOpenDetails: () => void
}) => {
  return v('div', null, [
    v(
      'button',
      {
        type: 'button',
        className: 'flex w-full flex-col items-center justify-center gap-2 p-4',
        onClick: input.onOpenDetails,
      },
      [
        v(Avatar, { src: input.profile ? UserProfile.toAvatarUrl(input.profile) : '', className: 'size-24' }),
        input.profile && v(Typography, { variant: 'title', text: input.ctx.t('username', input.profile?.username) }),
        v('div', { className: 'flex items-center gap-2' }, [
          input.ctx.space.hostId === input.profile?.userId && v(ViewHostChip, { ctx: input.ctx }),
          input.ctx.currentUser.userId === input.profile?.userId && v(ViewYouChip, { ctx: input.ctx }),
        ]),
      ],
    ),

    v('div', { className: 'w-full px-4 pb-8' }, [
      v(Button, { onClick: input.onOpenDetails, className: 'w-full', text: input.ctx.t('spaces.see-profile') }),
    ]),
  ])
}

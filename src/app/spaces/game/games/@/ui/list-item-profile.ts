import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Avatar } from '~/@/ui/avatar'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { UserProfile } from '~/app/@/data/user-profile'

export const ProfileListItem = ({
  profile,
  subtitle,
  ctx,
}: {
  ctx: {
    t: Translator
  }
  profile?: UserProfile | null
  subtitle?: TranslatedText
}) => {
  return h('div', { className: 'flex w-full items-center gap-2 p-2' }, [
    h(Avatar, { className: 'size-12', src: profile ? UserProfile.toAvatarUrl(profile) : '' }),
    h(
      'div',
      { className: 'flex flex-1 flex-col gap-0.5' },
      [
        profile && h(Typography, { variant: 'body', text: ctx.t('username', profile.username) }),
        subtitle && h(Typography, { color: 'text-secondary', variant: 'caption', text: subtitle }),
      ].filter(Boolean),
    ),
  ])
}

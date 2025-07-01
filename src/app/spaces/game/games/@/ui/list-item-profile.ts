import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Avatar } from '~/@/ui/avatar'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'
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
  return v('div', { class: 'flex w-full items-center gap-2 p-2' }, [
    v(Avatar, { class: 'size-12', src: profile ? UserProfile.toAvatarUrl(profile) : '' }),
    v(
      'div',
      { class: 'flex flex-1 flex-col gap-0.5' },
      [
        profile && v(Typography, { variant: 'body', text: ctx.t('username', profile.username) }),
        subtitle && v(Typography, { color: 'text-secondary', variant: 'caption', text: subtitle }),
      ].filter(Boolean),
    ),
  ])
}

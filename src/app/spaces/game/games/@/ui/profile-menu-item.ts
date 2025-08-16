import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Avatar } from '~/@/ui/avatar'
import { sx } from '~/@/vdom/style/sx'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { UserProfile } from '~/app/@/data/user-profile'

export const ProfileMenuItem = ({
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
  return h(Box, { style: sx({ flexDirection: 'row', width: 'full', alignItems: 'center', gap: 2, padding: 2 }) }, [
    h(Avatar, { style: sx({ size: 12 }), src: profile ? UserProfile.toAvatarUrl(profile) : '' }),
    h(
      Box,
      { style: sx({ flexDirection: 'col', flex: 1, gap: 0.5 }) },
      [
        profile && h(Typography, { variant: 'body', text: ctx.t('username', profile.username) }),
        subtitle && h(Typography, { color: 'text-secondary', variant: 'caption', text: subtitle }),
      ].filter(Boolean),
    ),
  ])
}

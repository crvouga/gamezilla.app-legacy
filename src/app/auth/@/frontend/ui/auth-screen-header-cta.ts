import { Translator } from '~/@/l18n/generated'
import { sx } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'

export const AuthScreenHeaderCta = (input: { ctx: { t: Translator } }) => {
  return h(
    Box,
    { style: sx({ flexDirection: 'col', width: 'full', alignItems: 'flex-start', justifyContent: 'center' }) },
    [
      h(Typography, {
        text: input.ctx.t('auth.sign-in-to'),
        variant: 'title',
      }),
      h(Text, {
        style: sx({ textColor: 'blue-500', paddingBottom: 2, fontSize: '5xl', fontWeight: 'black' }),
        text: input.ctx.t('app.gamezilla-app'),
      }),
    ],
  )
}

import { Translator } from '~/@/l18n/generated'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'

export const AuthScreenHeaderCta = (input: { ctx: { t: Translator } }) => {
  return h(Box, { class: 'flex w-full flex-col items-start justify-center' }, [
    h(Typography, {
      text: input.ctx.t('auth.sign-in-to'),
      variant: 'title',
    }),
    h(Text, {
      class: 'bg-gradient-to-b from-blue-400 to-blue-500 bg-clip-text pb-2 text-5xl font-extrabold text-transparent',
      text: input.ctx.t('app.gamezilla-app'),
    }),
  ])
}

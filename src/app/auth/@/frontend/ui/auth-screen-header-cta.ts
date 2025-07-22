import { Translator } from '~/@/l18n/generated'
import { Box } from '~/@/vdom/box'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'

export const AuthScreenHeaderCta = (input: {
  ctx: {
    t: Translator
  }
}) => {
  return h(
    Box,
    {
      class: 'flex w-full flex-col items-start justify-center',
    },
    [
      h(Typography, {
        text: input.ctx.t('auth.sign-in-to'),
        variant: 'title',
      }),
      h(
        Box,
        {
          class:
            'bg-gradient-to-b from-blue-400 to-blue-500 bg-clip-text pb-2 text-5xl font-extrabold text-transparent',
        },
        [input.ctx.t('app.gamezilla-app')],
      ),
    ],
  )
}

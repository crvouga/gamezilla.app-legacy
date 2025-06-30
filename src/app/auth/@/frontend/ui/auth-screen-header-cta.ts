import { Translator } from '~/@/l18n/generated'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'

export const AuthScreenHeaderCta = (input: {
  ctx: {
    t: Translator
  }
}) => {
  return h('div', {
    className: 'flex w-full flex-col items-start justify-center',
    children: [
      h(Typography, {
        text: input.ctx.t('auth.sign-in-to'),
        variant: 'title',
      }),
      h('span', {
        className:
          'bg-gradient-to-b from-blue-400 to-blue-500 bg-clip-text pb-2 text-5xl font-extrabold text-transparent',
        children: input.ctx.t('app.gamezilla-app'),
      }),
    ],
  })
}

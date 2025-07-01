import { Translator } from '~/@/l18n/generated'
import { Frag } from '~/@/ui/frag'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'

export const AuthScreenHeaderCta = (input: {
  ctx: {
    t: Translator
  }
}) => {
  return v('div', {
    class: 'flex w-full flex-col items-start justify-center',
    children: v(Frag, {}, [
      v(Typography, {
        text: input.ctx.t('auth.sign-in-to'),
        variant: 'title',
      }),
      v('span', {
        class: 'bg-gradient-to-b from-blue-400 to-blue-500 bg-clip-text pb-2 text-5xl font-extrabold text-transparent',
        children: input.ctx.t('app.gamezilla-app'),
      }),
    ]),
  })
}

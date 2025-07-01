import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Frag } from '~/@/ui/frag'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'

export const AuthScreenHeader = (input: {
  ctx: {
    t: Translator
  }
  title: TranslatedText
  onBack: () => void
}) => {
  return v('div', {
    class: 'flex w-full flex-row items-center justify-start gap-2',
    children: v(Frag, {}, [
      v(IconButton, {
        class: '-ml-2',
        label: input.ctx.t('app.back'),
        renderIcon: (iconInput) => v(IconArrowLeft, iconInput),
        onClick: input.onBack,
        dataTestId: 'nav/back-button',
      }),
      v(Typography, {
        text: input.title,
        variant: 'title',
        class: 'font-bold',
      }),
    ]),
  })
}

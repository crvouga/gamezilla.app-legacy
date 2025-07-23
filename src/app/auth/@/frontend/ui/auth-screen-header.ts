import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { Translator } from '~/@/l18n/generated'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'

export const AuthScreenHeader = (input: {
  ctx: {
    t: Translator
  }
  title: TranslatedText
  onBack: () => void
}) => {
  return h(
    Box,
    {
      class: 'flex flex-row w-full flex-row items-center justify-start gap-2',
    },
    [
      h(IconButton, {
        class: '-ml-2',
        label: input.ctx.t('app.back'),
        renderIcon: (iconInput) => h(IconArrowLeft, iconInput),
        onPress: input.onBack,
        ariaLabel: input.ctx.t('app.back'),
      }),
      h(Typography, {
        text: input.title,
        variant: 'title',
        class: 'font-bold',
      }),
    ],
  )
}

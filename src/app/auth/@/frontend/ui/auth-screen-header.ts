import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { sx } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'

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
      style: sx({ flexDirection: 'row', width: 'full', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }),
    },
    [
      h(IconButton, {
        label: input.ctx.t('app.back'),
        renderIcon: (iconInput) => h(IconArrowLeft, iconInput),
        onPress: input.onBack,
        ariaLabel: input.ctx.t('app.back'),
      }),
      h(Typography, {
        text: input.title,
        variant: 'title',
        style: sx({ fontWeight: 'bold' }),
      }),
    ],
  )
}

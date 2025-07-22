import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { LOGO_TEXT } from './logo-text'

export const SplashScreen = (input: { reason: TranslatedText }) => {
  return h(
    Box,
    {
      class: 'fixed inset-0 grid place-items-center gap-4 text-7xl',
    },
    [
      LOGO_TEXT,
      false &&
        h(Typography, {
          text: input.reason,
          variant: 'caption',
          color: 'text-secondary',
        }),
    ].filter(Boolean),
  )
}

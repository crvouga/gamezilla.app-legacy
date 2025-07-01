import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'
import { LOGO_TEXT } from './logo-text'

export const SplashScreen = (input: { reason: TranslatedText }) => {
  return v(
    'div',
    {
      class: 'fixed inset-0 grid place-items-center gap-4 text-7xl',
    },
    [
      LOGO_TEXT,
      false &&
        v(Typography, {
          text: input.reason,
          variant: 'caption',
          color: 'text-secondary',
          class: 'fixed bottom-10 left-1/2 -translate-x-1/2',
        }),
    ].filter(Boolean),
  )
}

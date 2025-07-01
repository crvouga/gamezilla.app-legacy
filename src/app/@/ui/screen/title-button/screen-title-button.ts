import { TranslatedText } from '~/@/l18n'
import { Button } from '~/@/ui/button'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'

export const ScreenTitleButton = (input: {
  title: TranslatedText
  buttonText: TranslatedText
  onClick: () => void
}) => {
  return v('div', { className: 'flex flex-1 flex-col items-center justify-center gap-4' }, [
    v(Typography, { variant: 'title', text: input.title }),
    v(Button, {
      onClick: input.onClick,
      size: 'lg',
      variant: 'contained',
      color: 'primary',
      text: input.buttonText,
    }),
  ])
}

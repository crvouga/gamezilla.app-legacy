import { TranslatedText } from '~/@/l18n'
import { Button } from '~/@/ui/button'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'

export const ScreenTitleButton = (input: {
  title: TranslatedText
  buttonText: TranslatedText
  onClick: () => void
}) => {
  return h('div', { className: 'flex flex-1 flex-col items-center justify-center gap-4' }, [
    h(Typography, { variant: 'title', text: input.title }),
    h(Button, {
      onClick: input.onClick,
      size: 'lg',
      variant: 'contained',
      color: 'primary',
      text: input.buttonText,
    }),
  ])
}

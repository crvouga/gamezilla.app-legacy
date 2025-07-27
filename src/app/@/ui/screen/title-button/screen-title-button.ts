import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { Button } from '~/@/ui/button'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'

export const ScreenTitleButton = (input: {
  title: TranslatedText
  buttonText: TranslatedText
  onPress: () => void
}) => {
  return h(Box, { class: 'flex flex-1 flex-col items-center justify-center gap-4' }, [
    h(Typography, { variant: 'title', text: input.title }),
    h(Button, {
      width: 'full',
      onPress: input.onPress,
      size: 'lg',
      variant: 'contained',
      color: 'primary',
      text: input.buttonText,
    }),
  ])
}

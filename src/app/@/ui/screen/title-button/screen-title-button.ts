import { TranslatedText } from '~/@/l18n'
import { Button } from '~/@/ui/button'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'

export const ScreenTitleButton = (input: {
  title: TranslatedText
  buttonText: TranslatedText
  onPress: () => void
}) => {
  return h(
    Box,
    {
      style: theme({
        flexDirection: 'col',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      }),
    },
    [
      h(Typography, { variant: 'title', text: input.title }),
      h(Button, {
        width: 'full',
        onPress: input.onPress,
        size: 'lg',
        variant: 'contained',
        color: 'primary',
        text: input.buttonText,
      }),
    ],
  )
}

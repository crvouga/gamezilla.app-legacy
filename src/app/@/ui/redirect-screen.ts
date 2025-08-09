import { TranslatedText } from '~/@/l18n'
import { Button } from '~/@/ui/button'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'

export const RedirectScreen = (props: { onPress: () => void; buttonText: TranslatedText; text: TranslatedText }) => {
  return h(
    Box,
    {
      style: theme({
        flexDirection: 'col',
        width: 'full',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }),
    },
    [
      h(Typography, { text: props.text }),
      h(
        Button,
        {
          variant: 'contained',
          color: 'primary',
          onPress: props.onPress,
          text: props.buttonText,
        },
        [],
      ),
    ],
  )
}

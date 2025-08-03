import { TranslatedText } from '~/@/l18n'
import { theme } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'

export const SplashScreen = (_props: { reason?: TranslatedText }) => {
  return h(
    Box,
    {
      style: theme({
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
      }),
    },
    [
      h(Text, {
        text: '🦕',
        style: theme({ fontSize: 64, textColor: 'white' }),
      }),
    ],
  )
}

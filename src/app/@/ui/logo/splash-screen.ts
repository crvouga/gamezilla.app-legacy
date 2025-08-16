import { TranslatedText } from '~/@/l18n'
import { sx } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'

export const SplashScreen = (_props: { reason?: TranslatedText }) => {
  return h(
    Box,
    {
      style: sx({
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
      }),
    },
    [
      h(Text, {
        text: '🦕',
        style: sx({ fontSize: 64 }),
      }),
    ],
  )
}

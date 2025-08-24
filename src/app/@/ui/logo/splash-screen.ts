import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom'
import { Box } from '~/@/vdom/primitives/box'
import { sx } from '~/@/vdom/style/sx'
import { Logo } from './logo'

export const SplashScreen = (_props: { reason?: TranslatedText }) => {
  return h(
    Box,
    {
      style: sx({
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }),
    },
    [
      h(Logo, {
        width: 120,
      }),
    ],
  )
}

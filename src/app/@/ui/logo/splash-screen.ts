import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'

export const SplashScreen = (_props: { reason?: TranslatedText }) => {
  return h(Box, { class: 'h-screen w-screen flex items-center justify-center bg-black' }, [
    h(Text, { text: '🦕', class: 'text-[64px] text-white' }),
  ])
}

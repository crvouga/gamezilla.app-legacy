import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'

export const SplashScreen = (_props: { reason?: TranslatedText }) => {
  return h(Box, { class: 'h-full w-full flex items-center justify-center text-[64px]' }, [Text({ text: '🦕' })])
}

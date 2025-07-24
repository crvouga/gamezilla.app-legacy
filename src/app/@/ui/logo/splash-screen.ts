import { TranslatedText } from '~/@/l18n'
import { Text } from '~/@/vdom/primitives/text'

export const SplashScreen = (_props: { reason?: TranslatedText }) => {
  return Text({ class: 'h-full w-full flex items-center justify-center text-[64px]', text: '🦕' })
}

import { h } from '~/@/vdom/h'
import { Text } from '~/@/vdom/primitives/text'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { LOGO_TEXT } from './logo-text'

export const NavBarLogo = (input: { onPressDown: () => void }) => {
  return h(
    Pressable,
    {
      class: 'flex flex-row h-full w-full items-center justify-center text-4xl',
      onPressDown: input.onPressDown,
    },
    [Text({ text: LOGO_TEXT })],
  )
}

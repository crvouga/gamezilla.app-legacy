import { h } from '~/@/vdom/h'
import { Text } from '~/@/vdom/primitives/text'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { LOGO_TEXT } from './logo-text'

export const NavBarLogo = (input: { onClick: () => void }) => {
  return h(
    Pressable,
    {
      class: 'flex h-full w-full items-center justify-center text-4xl',
      onClick: input.onClick,
    },
    [Text({ text: LOGO_TEXT })],
  )
}

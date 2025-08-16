import { sx } from '~/@/vdom/style/sx'
import { h } from '~/@/vdom/h'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { Text } from '~/@/vdom/primitives/text'
import { LOGO_TEXT } from './logo-text'

export const NavBarLogo = (input: { onPress: () => void }) => {
  return h(
    Pressable,
    {
      style: sx({
        flexDirection: 'row',
        width: 'full',
        height: 'full',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4xl',
      }),
      onPress: input.onPress,
    },
    [h(Text, { text: LOGO_TEXT })],
  )
}

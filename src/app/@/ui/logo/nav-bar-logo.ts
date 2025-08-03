import { theme } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { Text } from '~/@/vdom/primitives/text'
import { LOGO_TEXT } from './logo-text'

export const NavBarLogo = (input: { onPress: () => void }) => {
  return h(
    Pressable,
    {
      style: theme({
        flexDirection: 'row',
        width: 'full',
        height: 'full',
        alignItems: 'center',
        justifyContent: 'center',
        textSize: '4xl',
      }),
      onPress: input.onPress,
    },
    [h(Text, { text: LOGO_TEXT })],
  )
}

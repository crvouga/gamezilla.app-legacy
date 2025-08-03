import { theme } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { SafeAreaBox } from '~/@/vdom/primitives/safe-area-box'
import { VDom } from '~/@/vdom/vdom'

export const AppRoot = (input: { children: VDom[] }) => {
  return h(
    SafeAreaBox,
    {
      edges: ['top', 'bottom', 'left', 'right'],
      style: theme({
        flex: 1,
        width: 'full',
        flexDirection: 'col',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'black',
        textColor: 'white',
      }),
    },
    input.children,
  )
}

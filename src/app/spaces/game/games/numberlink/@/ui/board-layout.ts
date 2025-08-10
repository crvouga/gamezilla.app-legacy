import { sx } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'

export const BoardLayout = (props: { children: VDom[] }) => {
  return h(
    Box,
    {
      style: sx({
        flexDirection: 'col',
        width: 'full',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }),
    },
    props.children,
  )
}

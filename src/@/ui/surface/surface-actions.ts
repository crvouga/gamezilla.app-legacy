import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { sx } from '../../vdom/style/sx'

export const SurfaceActions = (input: { children: VDom }) => {
  return h(
    Box,
    {
      style: sx({
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
        gap: 6,
        padding: 6,
        paddingTop: 6,
      }),
    },
    [input.children],
  )
}

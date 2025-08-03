import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { theme } from '../theme/theme'

export const SurfaceActions = (input: { children: VDom }) => {
  return h(
    Box,
    {
      style: theme({
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
        gap: 6,
        padding: 6,
        pt: 6,
      }),
    },
    [input.children],
  )
}

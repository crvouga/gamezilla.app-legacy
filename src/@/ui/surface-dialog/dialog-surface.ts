import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { Surface } from '../surface'
import { theme } from '../theme/theme'

export const DialogSurface = (input: { children: VDom }) => {
  return h(
    Surface,
    {
      style: theme({
        position: 'relative',
        zIndex: 50,
        width: 'full',
        maxWidth: 400,
        flexDirection: 'col',
        rounded: 'lg',
        // shadow: 2,
      }),
    },
    [input.children],
  )
}

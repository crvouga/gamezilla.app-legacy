import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { Surface } from '../surface'
import { sx } from '../../vdom/style/sx'

export const DialogSurface = (input: { children: VDom }) => {
  return h(
    Surface,
    {
      style: sx({
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

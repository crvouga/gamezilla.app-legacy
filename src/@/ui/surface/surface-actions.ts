import { VDom } from '~/@/vdom/vdom'
import { Box } from '~/@/vdom/primitives/box'
import { h } from '~/@/vdom/h'

export const SurfaceActions = (input: { children: VDom }) => {
  return h(Box, { class: 'flex w-full items-center gap-6 p-6 pt-6' }, [input.children])
}

import { VDom } from '~/@/vdom/vdom'
import { Box } from '~/@/vdom/primitives/box'
import { h } from '~/@/vdom/h'

export const SurfaceBody = (input: { children?: VDom }) => {
  return h(Box, { class: 'px-6 py-3 text-left' }, [input.children])
}

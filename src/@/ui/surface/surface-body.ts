import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { sx } from '../theme/theme'

export const SurfaceBody = (input: { children?: VDom }) => {
  return h(Box, { style: sx({ paddingX: 6, paddingY: 3, textAlign: 'left' }) }, [input.children])
}

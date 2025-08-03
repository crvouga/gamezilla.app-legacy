import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { theme } from '../theme/theme'

export const SurfaceBody = (input: { children?: VDom }) => {
  return h(Box, { style: theme({ px: 6, py: 3, textAlign: 'left' }) }, [input.children])
}

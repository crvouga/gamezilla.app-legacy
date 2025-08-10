import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { sx } from './theme/theme'

export const PAPER_STYLE = sx({
  backgroundColor: 'neutral-900',
  borderColor: 'neutral-800',
  rounded: 'lg',
})

export const Paper = (props: { style?: Record<string, unknown>; children: VDom[] }) => {
  return h(Box, { style: { ...PAPER_STYLE, ...props.style } }, props.children)
}

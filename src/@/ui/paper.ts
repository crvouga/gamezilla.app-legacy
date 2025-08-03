import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { cn } from './cn'

export const PAPER_CLASS_NAME = 'bg-neutral-900 border border-neutral-800 rounded-lg'

export const Paper = (props: { style?: Record<string, unknown>; class?: string; children: VDom[] }) => {
  return h(Box, { class: cn(PAPER_CLASS_NAME, props.class), style: props.style }, props.children)
}

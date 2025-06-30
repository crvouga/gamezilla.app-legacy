import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const Box = (input: { children: VDom; className?: string }) => {
  return h('div', { className: input.className }, input.children)
}

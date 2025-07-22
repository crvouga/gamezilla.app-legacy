import { h, IntrinsicAttributes } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const Box = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  return h('div', props, children)
}

import { h, IntrinsicAttributes } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const Touchable = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  return h('button', props, children)
}

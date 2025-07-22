import { h, IntrinsicAttributes } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const Touchable = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  // @ts-ignore
  return h('button', props, children)
}

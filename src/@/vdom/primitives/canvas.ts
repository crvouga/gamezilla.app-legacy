import { h, IntrinsicAttributes } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const Canvas = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  // @ts-ignore
  return h('canvas', props, children)
}

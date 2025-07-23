import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/vdom-engine/impl'
import { IntrinsicAttributes } from '~/@/vdom/vdom-engine/interface'
import { CANVAS_TAG } from '../tags'

export const Canvas = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  return h(CANVAS_TAG, props, children)
}

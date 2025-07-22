import { h, IntrinsicAttributes, tag } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const CANVAS_TAG = tag('canvas')

export const Canvas = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  return h(CANVAS_TAG, props, children)
}

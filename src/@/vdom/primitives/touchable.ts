import { h, IntrinsicAttributes, tag } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const TOUCHABLE_TAG = tag('button')

export const Touchable = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  return h(TOUCHABLE_TAG, props, children)
}

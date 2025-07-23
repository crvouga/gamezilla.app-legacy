import { h, IntrinsicAttributes, tag } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const PRESSABLE_TAG = tag('button')

export const Pressable = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  return h(PRESSABLE_TAG, props, children)
}

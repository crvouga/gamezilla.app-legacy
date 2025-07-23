import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/vdom-engine/impl'
import { IntrinsicAttributes } from '~/@/vdom/vdom-engine/interface'
import { PRESSABLE_TAG } from '../tags'

export const Pressable = ({ children, ...props }: IntrinsicAttributes & { children: VDom[] }) => {
  return h(PRESSABLE_TAG, props, children)
}

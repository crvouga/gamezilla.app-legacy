import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { PRESSABLE_TAG } from '../tags'

export type PressableProps = PrimitiveProps & {
  children: VDom[]
}

export const Pressable = ({ children, ...props }: PressableProps) => {
  return h(PRESSABLE_TAG, props, children)
}

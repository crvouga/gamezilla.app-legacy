import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { SCROLL_BOX_TAG } from '../tags'
import { VDom } from '../vdom'

export type ScrollBoxProps = PrimitiveProps & {
  children?: VDom[]
  contentContainerStyle?: {
    rowGap?: number
    columnGap?: number
  }
}

export const ScrollBox = ({ children, ...props }: ScrollBoxProps) => {
  return h(SCROLL_BOX_TAG, props, children)
}

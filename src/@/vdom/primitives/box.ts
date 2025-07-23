import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { BOX_TAG } from '../tags'
import { VDom } from '../vdom'

export type BoxProps = PrimitiveProps & {
  children?: VDom[]
}

export const Box = ({ children, ...props }: BoxProps) => {
  return h(BOX_TAG, props, children)
}

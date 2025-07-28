import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { CIRCLE_TAG } from '../../tags'
import { VDom } from '../../vdom'

export const Circle = ({ children, ...input }: PrimitiveSvgProps): VDom => {
  return h(CIRCLE_TAG, input, children)
}

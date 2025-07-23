import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { MASK_TAG } from '../../tags'

export const Mask = ({ children, ...input }: PrimitiveSvgProps) => {
  return h(MASK_TAG, input, children)
}

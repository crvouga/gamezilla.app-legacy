import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { RADIAL_GRADIENT_TAG } from '../../tags'

export const RadialGradient = ({ children, ...input }: PrimitiveSvgProps) => {
  return h(RADIAL_GRADIENT_TAG, input, children)
}

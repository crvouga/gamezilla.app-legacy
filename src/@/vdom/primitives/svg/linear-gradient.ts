import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { LINEAR_GRADIENT_TAG } from '../../tags'

export const LinearGradient = ({ children, ...input }: PrimitiveSvgProps) => {
  return h(LINEAR_GRADIENT_TAG, input, children)
}

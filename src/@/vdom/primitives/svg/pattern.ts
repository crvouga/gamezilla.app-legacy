import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { PATTERN_TAG } from '../../tags'

export const Pattern = ({ children, ...input }: PrimitiveSvgProps) => {
  return h(PATTERN_TAG, input, children)
}

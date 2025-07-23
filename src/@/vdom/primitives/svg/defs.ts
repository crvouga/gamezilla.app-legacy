import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { DEFS_TAG } from '../../tags'

export const Defs = ({ children, ...input }: PrimitiveSvgProps) => {
  return h(DEFS_TAG, input, children)
}

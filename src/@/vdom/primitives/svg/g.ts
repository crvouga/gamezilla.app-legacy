import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { G_TAG } from '../../tags'

export const G = ({ children, ...input }: PrimitiveSvgProps) => {
  return h(G_TAG, input, children)
}

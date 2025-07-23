import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { SVG_TAG } from '../../tags'

export const Svg = ({ children, ...input }: PrimitiveSvgProps) => {
  return h(SVG_TAG, input, children)
}

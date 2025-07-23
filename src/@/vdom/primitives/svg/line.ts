import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { LINE_TAG } from '../../tags'

export const Line = ({ children, ...input }: PrimitiveSvgProps) => {
  return h(LINE_TAG, input, children)
}

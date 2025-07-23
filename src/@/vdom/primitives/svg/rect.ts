import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { RECT_TAG } from '../../tags'

export const Rect = ({ children, ...input }: PrimitiveSvgProps) => {
  return h(RECT_TAG, input, children)
}

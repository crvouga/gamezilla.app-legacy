import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { STOP_TAG } from '../../tags'

export const Stop = ({ children, ...input }: PrimitiveSvgProps) => {
  return h(STOP_TAG, input, children)
}

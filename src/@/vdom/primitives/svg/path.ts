import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { PATH_TAG } from '../../tags'

export const Path = ({ children, ...props }: PrimitiveSvgProps) => {
  return h(PATH_TAG, props, children)
}

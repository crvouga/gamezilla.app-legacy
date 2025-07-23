import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { CLIP_PATH_TAG } from '../../tags'

export const ClipPath = ({ children, ...input }: PrimitiveSvgProps) => {
  return h(CLIP_PATH_TAG, input, children)
}

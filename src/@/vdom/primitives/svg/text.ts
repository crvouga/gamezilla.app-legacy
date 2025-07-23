import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveSvgProps } from '../../primitive-svg-props'
import { SVG_TEXT_TAG } from '../../tags'

export type SvgTextProps = PrimitiveSvgProps & {
  text: string
}

export const SvgText = ({ text, ...props }: SvgTextProps) => {
  // @ts-ignore
  return h(SVG_TEXT_TAG, props, [text])
}

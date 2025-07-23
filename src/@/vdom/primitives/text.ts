import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { TEXT_TAG } from '../tags'
import { VDom } from '../vdom'

export type TextProps = PrimitiveProps & {
  text: string
}

export const Text = ({ text, ...props }: TextProps): VDom => {
  return h(TEXT_TAG, props, [text as unknown as VDom])
}

import { h } from '~/@/vdom/h'
import { PrimitiveProps } from '../../primitive-props'
import { BOX_TAG } from '../../tags'

export const WebScrollBox = (props: PrimitiveProps) => {
  return h(BOX_TAG, { ...props, style: { ...props.style, 'overflow-y': 'scroll', flex: 1 } }, props.children)
}

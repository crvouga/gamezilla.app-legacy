import { h } from '~/@/vdom/h'
import { SafeAreaBoxProps } from '../../primitives/safe-area-box'
import { BOX_TAG } from '../../tags'
import { VDom } from '../../vdom'
import { addSafeArea } from './add-safe-area'

export const WebSafeAreaBox = (props: SafeAreaBoxProps): VDom => {
  const { edges, style } = props
  return h(BOX_TAG, { ...props, style: addSafeArea(edges, style) }, props.children)
}

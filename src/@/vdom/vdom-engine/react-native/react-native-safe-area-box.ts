import { h } from '~/@/vdom/h'
import { SafeAreaBoxEdge, SafeAreaBoxProps } from '../../primitives/safe-area-box'
import { BOX_TAG } from '../../tags'
import { VDom } from '../../vdom'
import { SafeAreaInsets } from './safe-area-insets'

const addSafeArea = (edges: SafeAreaBoxEdge[], styles: Record<string, unknown> = {}): Record<string, unknown> => {
  const insets = SafeAreaInsets.get()
  if (edges.includes('top')) {
    styles.paddingTop = insets.top
  }
  if (edges.includes('bottom')) {
    styles.paddingBottom = insets.bottom
  }
  if (edges.includes('left')) {
    styles.paddingLeft = insets.left
  }
  if (edges.includes('right')) {
    styles.paddingRight = insets.right
  }
  return styles
}

export const ReactNativeSafeAreaBox = (props: SafeAreaBoxProps): VDom => {
  const { edges, style } = props
  return h(BOX_TAG, { ...props, style: addSafeArea(edges, style) }, props.children)
}

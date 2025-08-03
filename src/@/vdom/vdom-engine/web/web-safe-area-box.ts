import { h } from '~/@/vdom/h'
import { ALL_SAFE_AREA_BOX_EDGES, SafeAreaBoxEdge, SafeAreaBoxProps } from '../../primitives/safe-area-box'
import { BOX_TAG } from '../../tags'
import { VDom } from '../../vdom'

const safeAreaEdgeToStyle = (edge: SafeAreaBoxEdge | unknown) => {
  switch (edge) {
    case 'top':
      return 'env(safe-area-inset-top)'
    case 'bottom':
      return 'env(safe-area-inset-bottom)'
    case 'left':
      return 'env(safe-area-inset-left)'
    case 'right':
      return 'env(safe-area-inset-right)'
    default:
      return '0'
  }
}

const addSafeArea = (edges: SafeAreaBoxEdge[], styles: Record<string, unknown> = {}): Record<string, unknown> => {
  styles.padding = ALL_SAFE_AREA_BOX_EDGES.map((edge) => (edges.includes(edge) ? safeAreaEdgeToStyle(edge) : '0')).join(
    ' ',
  )

  return styles
}

export const WebSafeAreaBox = (props: SafeAreaBoxProps): VDom => {
  const { edges, style } = props
  return h(
    BOX_TAG,
    {
      ...props,
      style: addSafeArea(edges, style),
    },
    props.children,
  )
}

import { h } from '~/@/vdom/h'
import { PrimitiveProps } from '../../primitive-props'
import { ALL_SAFE_AREA_BOX_EDGES, SafeAreaBoxEdge } from '../../primitives/safe-area-box'
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

const updateSafeAreaProps = (props: any) => {
  if (Array.isArray(props.edges)) {
    props.style = {
      ...props.style,
      padding: ALL_SAFE_AREA_BOX_EDGES.map((edge) => {
        if (props.edges.includes(edge)) return safeAreaEdgeToStyle(edge)
        return '0'
      }).join(' '),
    }
  }
}

export const WebSafeAreaBox = (props: PrimitiveProps): VDom => {
  updateSafeAreaProps(props)
  return h(BOX_TAG, props, props.children)
}

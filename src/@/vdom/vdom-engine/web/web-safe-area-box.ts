import { h } from '~/@/vdom/h'
import { SafeAreaBoxEdge, SafeAreaBoxProps } from '../../primitives/safe-area-box'
import { BOX_TAG } from '../../tags'
import { VDom } from '../../vdom'

const addSafeArea = (edges: SafeAreaBoxEdge[], styles: Record<string, unknown> = {}): Record<string, unknown> => {
  for (const edge of edges) {
    switch (edge) {
      case 'top':
        if (styles.paddingTop == null) {
          styles.paddingTop = 'env(safe-area-inset-top)'
        } else {
          styles.paddingTop = `calc(${styles.paddingTop} + env(safe-area-inset-top))`
        }
        break
      case 'bottom':
        if (styles.paddingBottom == null) {
          styles.paddingBottom = 'env(safe-area-inset-bottom)'
        } else {
          styles.paddingBottom = `calc(${styles.paddingBottom} + env(safe-area-inset-bottom))`
        }
        break
      case 'left':
        if (styles.paddingLeft == null) {
          styles.paddingLeft = 'env(safe-area-inset-left)'
        } else {
          styles.paddingLeft = `calc(${styles.paddingLeft} + env(safe-area-inset-left))`
        }
        break
      case 'right':
        if (styles.paddingRight == null) {
          styles.paddingRight = 'env(safe-area-inset-right)'
        } else {
          styles.paddingRight = `calc(${styles.paddingRight} + env(safe-area-inset-right))`
        }
        break
    }
  }
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

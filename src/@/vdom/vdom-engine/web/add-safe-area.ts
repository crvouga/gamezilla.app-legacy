import { SafeAreaBoxEdge } from '../../primitives/safe-area-box'

export const addSafeArea = (
  edges: SafeAreaBoxEdge[],
  styles: Record<string, unknown> = {},
): Record<string, unknown> => {
  for (const edge of edges) {
    switch (edge) {
      case 'top':
        if (styles.paddingTop == null) {
          styles.paddingTop = 'env(safe-area-inset-top)'
          break
        }

        styles.paddingTop = `calc(${styles.paddingTop} + env(safe-area-inset-top))`
        break
      case 'bottom':
        if (styles.paddingBottom == null) {
          styles.paddingBottom = 'env(safe-area-inset-bottom)'
          break
        }
        styles.paddingBottom = `calc(${styles.paddingBottom} + env(safe-area-inset-bottom))`
        break
      case 'left':
        if (styles.paddingLeft == null) {
          styles.paddingLeft = 'env(safe-area-inset-left)'
          break
        }

        styles.paddingLeft = `calc(${styles.paddingLeft} + env(safe-area-inset-left))`
        break
      case 'right':
        if (styles.paddingRight == null) {
          styles.paddingRight = 'env(safe-area-inset-right)'
          break
        }

        styles.paddingRight = `calc(${styles.paddingRight} + env(safe-area-inset-right))`
        break
    }
  }
  return styles
}

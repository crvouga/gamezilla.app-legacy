import { ALL_SAFE_AREA_BOX_EDGES, SafeAreaBoxEdge } from '../primitives/safe-area-box'

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

export const updateSafeAreaProps = (props: any) => {
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

export const updateScrollBoxProps = (props: any) => {
  props.style = { ...props.style, overflowY: 'scroll' }
}

export const normalizeStylesInPlace = (styles: Record<string, string | number | null>) => {
  const keys = Object.keys(styles)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!
    if (styles[key] === null) {
      delete styles[key]
    } else if (typeof styles[key] === 'number') {
      styles[key] = `${styles[key]}px`
    }
  }
}

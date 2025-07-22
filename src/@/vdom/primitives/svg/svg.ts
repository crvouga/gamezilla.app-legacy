import { h, tag } from '../../h'
import { VDom } from '../../vdom'

export const SVG_TAG = tag('svg')

export const Svg = ({
  children,
  ...input
}: {
  width?: number | string
  height?: number | string
  viewBox?: string
  class?: string
  key?: string | number | undefined
  xmlns?: string
  x?: number | string
  y?: number | string
  fill?: string
  stroke?: string
  'stroke-width'?: number | string
  xmlnsXlink?: string
  'stroke-linecap'?: string
  id?: string
  xmlSpace?: string
  'stroke-linejoin'?: string
  'stroke-miterlimit'?: number | string
  preserveAspectRatio?: string
  version?: string
  children: VDom[]
  'fill-rule'?: string
  'clip-rule'?: string
  onClick?: (event: unknown) => void
  onMouseDown?: (event: unknown) => void
  onMouseUp?: (event: unknown) => void
  onMouseLeave?: (event: unknown) => void
  onMouseEnter?: (event: unknown) => void
  onMouseMove?: (event: unknown) => void
  onMouseOut?: (event: unknown) => void
  onMouseOver?: (event: unknown) => void
  onTouchMove?: (event: unknown) => void
  onTouchStart?: (event: unknown) => void
  onTouchEnd?: (event: unknown) => void
  onTouchCancel?: (event: unknown) => void
  onTouchEnter?: (event: unknown) => void
  onTouchLeave?: (event: unknown) => void
  onTouchOver?: (event: unknown) => void
  onContextMenu?: (event: unknown) => void
  opacity?: number | string
}) => {
  return h(SVG_TAG, input, children)
}

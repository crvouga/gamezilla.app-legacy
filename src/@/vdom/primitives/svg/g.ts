import { h } from '~/@/vdom/vdom-engine/impl'
import { G_TAG } from '../../tags'
import { VDom } from '../../vdom'

export const G = ({
  children,
  ...input
}: {
  width?: number | string
  height?: number | string
  viewBox?: string
  class?: string
  key?: string | number | undefined | null | number | boolean
  xmlns?: string
  x?: number | string
  d?: string
  y?: number | string
  fill?: string
  'fill-opacity'?: number | string
  stroke?: string | null | undefined
  'stroke-width'?: number | string
  xmlnsXlink?: string
  'stroke-linecap'?: string
  id?: string
  'p-id'?: string | undefined | null
  xmlSpace?: string
  transform?: string
  'stroke-dasharray'?: number | string
  'stroke-dashoffset'?: number | string
  'stroke-linejoin'?: string
  'stroke-miterlimit'?: number | string
  'stroke-opacity'?: number | string
  preserveAspectRatio?: string
  version?: string
  children: VDom[]
  'fill-rule'?: string
  'clip-rule'?: string
  'clip-path'?: string | null | undefined
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
  return h(G_TAG, input, children)
}

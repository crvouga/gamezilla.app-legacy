import { h } from '~/@/vdom/vdom-engine/impl'
import { CIRCLE_TAG } from '../../tags'
import { VDom } from '../../vdom'

export const Circle = ({
  children,
  ...input
}: {
  width?: number | string
  height?: number | string
  viewBox?: string
  class?: string
  r?: number | string
  cx?: number | string
  cy?: number | string
  key?: string | number | undefined
  xmlns?: string
  x?: number | string
  y?: number | string
  fill?: string
  'fill-opacity'?: number | string
  stroke?: string
  'stroke-width'?: number | string
  xmlnsXlink?: string
  'font-size'?: number | string
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

  onPressDown?: (event: unknown) => void
  onPressUp?: (event: unknown) => void
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
  return h(CIRCLE_TAG, input, children)
}

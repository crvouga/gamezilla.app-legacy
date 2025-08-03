import { PrimitiveProps } from './primitive-props'
import { VDom } from './vdom'

export type PrimitiveSvgProps = PrimitiveProps & {
  width?: number | string
  height?: number | string
  viewBox?: string
  key?: string | number | undefined
  xmlns?: string
  x?: number | string
  'gradient-transform'?: string
  y?: number | string
  r?: number | string
  cx?: number | string
  cy?: number | string
  x1?: number | string
  y1?: number | string
  color?: string
  'clip-path'?: string
  x2?: number | string
  y2?: number | string
  d?: string
  'fill-opacity'?: number | string
  'font-size'?: number | string
  fill?: string
  stroke?: string
  'stroke-opacity'?: number | string
  'stroke-width'?: number | string
  xmlnsXlink?: string
  'stroke-linecap'?: string
  id?: string
  xmlSpace?: string
  patternUnits?: string
  'stroke-linejoin'?: string
  mask?: string | null | undefined
  rx?: number | string
  ry?: number | string
  transform?: string
  'stroke-miterlimit'?: number | string
  preserveAspectRatio?: string
  opacity?: number | string
  version?: string
  children: VDom[]
  'fill-rule'?: string
  'clip-rule'?: string
  'stroke-dasharray'?: string | number
  'stop-color'?: string
  'stop-opacity'?: number | string
  offset?: string | number
  // [key: string]: unknown
}

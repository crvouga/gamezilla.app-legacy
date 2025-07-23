import { PrimitiveProps } from './primitive-props'
import { VDom } from './vdom'

export type PrimitiveSvgProps = PrimitiveProps & {
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
  patternUnits?: string
  'stroke-linejoin'?: string
  mask?: string | null | undefined
  rx?: number | string
  ry?: number | string
  transform?: string
  'stroke-miterlimit'?: number | string
  preserveAspectRatio?: string
  version?: string
  children: VDom[]
  'fill-rule'?: string
  'clip-rule'?: string
}

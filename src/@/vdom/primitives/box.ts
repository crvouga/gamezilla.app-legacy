import type { AriaRole } from '~/@/html/aria-role'
import { h } from '~/@/vdom/vdom-engine/impl'
import { BOX_TAG } from '../tags'
import { VDom } from '../vdom'

export interface BoxProps {
  class?: string
  role?: AriaRole
  'aria-label'?: string
  'aria-selected'?: 'true' | 'false'
  'aria-hidden'?: 'true' | 'false'
  'aria-disabled'?: 'true' | 'false'
  'aria-role'?: AriaRole
  onClick?: (event: unknown) => void
  onMouseDown?: (event: unknown) => void
  onMouseUp?: (event: unknown) => void
  onMouseEnter?: (event: unknown) => void
  onMouseLeave?: (event: unknown) => void
  onMouseMove?: (event: unknown) => void
  onMouseOut?: (event: unknown) => void
  onMouseOver?: (event: unknown) => void
  children?: VDom[]
  [key: string]: unknown
}

export const Box = ({ children, ...props }: BoxProps) => {
  return h(BOX_TAG, props, children)
}

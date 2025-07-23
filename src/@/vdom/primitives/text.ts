import type { AriaRole } from '~/@/html/aria-role'
import { h } from '~/@/vdom/vdom-engine/impl'
import { VDom } from '../vdom'
import { TEXT_TAG } from '../tags'

export interface TextProps {
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
  text: string
  style?: Record<string, unknown>
}

export const Text = ({ text, ...props }: TextProps): VDom => {
  return h(TEXT_TAG, props, [text as unknown as VDom])
}

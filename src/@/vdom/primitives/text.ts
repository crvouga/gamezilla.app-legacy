import type { AriaRole } from '~/@/html/aria-role'
import { h, tag } from '~/@/vdom/h'
import { VDom } from '../vdom'

export const TEXT_TAG = tag('p')

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
}

export const Text = ({ text, ...props }: TextProps): VDom => {
  // @ts-ignore
  return h(TEXT_TAG, props, [text])
}

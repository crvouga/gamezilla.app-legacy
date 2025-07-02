import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { AriaRole } from '../vdom/aria-role'

export const SURFACE_CLASS_NAME = 'bg-black border border-neutral-700'

export const Surface = (input: {
  children?: VDom
  class?: string
  role?: AriaRole
  'aria-hidden'?: boolean
  'aria-label'?: string
}) => {
  return h(
    'div',
    {
      class: cn(SURFACE_CLASS_NAME, input.class),
      role: input.role,
      'aria-hidden': input['aria-hidden'] ? 'true' : 'false',
      'aria-label': input['aria-label'],
    },
    [input.children],
  )
}

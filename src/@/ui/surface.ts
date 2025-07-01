import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'

export const SURFACE_CLASS_NAME = 'bg-black border border-neutral-700'

export const Surface = (input: {
  children?: VDom
  class?: string
  role?: string
  'aria-hidden'?: boolean
  'aria-label'?: string
}) => {
  return h(
    'div',
    {
      class: cn(SURFACE_CLASS_NAME, input.class),
      role: input.role,
      'aria-hidden': input['aria-hidden'],
      'aria-label': input['aria-label'],
    },
    [input.children],
  )
}

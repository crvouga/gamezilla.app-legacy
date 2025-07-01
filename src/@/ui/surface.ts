import { cn } from '~/@/ui/cn'
import { v } from '~/@/vdom/v'
import { VDom } from '~/@/vdom/vdom'

export const SURFACE_CLASS_NAME = 'bg-black border border-neutral-700'

export const Surface = (input: { children?: VDom; class?: string; role?: string }) => {
  return v(
    'div',
    {
      class: cn(SURFACE_CLASS_NAME, input.class),
      role: input.role,
    },
    [input.children],
  )
}

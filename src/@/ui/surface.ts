import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'

export const SURFACE_CLASS_NAME = 'bg-black border border-neutral-700'

export const Surface = (input: { children?: VDom; className?: string; role?: string }) => {
  return h(
    'div',
    {
      className: cn(SURFACE_CLASS_NAME, input.className),
      role: input.role,
    },
    input.children,
  )
}

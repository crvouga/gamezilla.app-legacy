import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'

export const Dot = (input: { className: string; colorClassName: string }) => {
  return h('div', { className: cn(input.className, 'aspect-square shrink-0 p-[1px]') }, [
    h('div', { className: cn(input.colorClassName, 'h-full w-full shrink-0 rounded-full') }),
  ])
}

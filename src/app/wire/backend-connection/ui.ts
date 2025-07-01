import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'

export const Dot = (input: { class: string; colorClassName: string }) => {
  return h('div', { class: cn(input.class, 'aspect-square shrink-0 p-[1px]') }, [
    h('div', { class: cn(input.colorClassName, 'h-full w-full shrink-0 rounded-full') }),
  ])
}

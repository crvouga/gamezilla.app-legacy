import { cn } from '~/@/ui/cn'
import { v } from '~/@/vdom/v'

export const Dot = (input: { class: string; colorClassName: string }) => {
  return v('div', { class: cn(input.class, 'aspect-square shrink-0 p-[1px]') }, [
    v('div', { class: cn(input.colorClassName, 'h-full w-full shrink-0 rounded-full') }),
  ])
}

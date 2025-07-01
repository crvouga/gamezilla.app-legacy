import { cn } from '~/@/ui/cn'
import { v } from '~/@/vdom/v'

export const Dot = (input: { className: string; colorClassName: string }) => {
  return v('div', { className: cn(input.className, 'aspect-square shrink-0 p-[1px]') }, [
    v('div', { className: cn(input.colorClassName, 'h-full w-full shrink-0 rounded-full') }),
  ])
}

import { cn } from '~/@/ui/cn'
import { VDom } from '../vdom/vdom'

export const PAPER_CLASS_NAME = 'bg-white/10'

export const Paper = (input: { children?: VDom; className?: string }) => {
  return <div className={cn(PAPER_CLASS_NAME, input.className)}>{input.children}</div>
}

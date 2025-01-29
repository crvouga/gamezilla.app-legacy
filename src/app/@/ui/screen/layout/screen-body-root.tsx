import { VDomChildren } from '~/@/vdom/vdom'
import { cn } from '~/@/ui'

export const ScreenBodyRoot = (input: { children: VDomChildren; className?: string }) => {
  return <div className={cn('w-full flex-1', input.className)}>{input.children}</div>
}

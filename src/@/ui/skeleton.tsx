import { VDomChildren } from '~/@/vdom/vdom'
import { cn } from './cn'

const CLASS_NAME = 'pointer-events-none animate-pulse select-none rounded bg-neutral-500 text-transparent'

export const Skeleton = (input: { skeleton?: boolean; className?: string; children: VDomChildren }) => {
  return (
    <div className={cn(input.skeleton && CLASS_NAME, input.className)} aria-busy={input.skeleton}>
      {input.children}
    </div>
  )
}

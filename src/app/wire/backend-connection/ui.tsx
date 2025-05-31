import { cn } from '~/@/ui/cn'

export const Dot = (input: { className: string; colorClassName: string }) => {
  return (
    <div className={cn(input.className, 'aspect-square shrink-0 p-[1px]')}>
      <div className={cn(input.colorClassName, 'h-full w-full shrink-0 rounded-full')} />
    </div>
  )
}

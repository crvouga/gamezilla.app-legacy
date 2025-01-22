import { cn } from './cn'

export const PaginationDots = (input: { count: number; activeIndex: number }) => {
  return (
    <div className='flex items-center justify-center space-x-2'>
      {Array.from({ length: input.count }, (_, i) => {
        return (
          <div key={i} className={cn('size-2 rounded-full', i === input.activeIndex ? 'bg-white' : 'bg-neutral-500')} />
        )
      })}
    </div>
  )
}

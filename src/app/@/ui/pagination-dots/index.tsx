import { cn } from '../cn'

export const PAGINATION_DOTS_TEST_ID = 'pagination-dots'

export const PaginationDots = (input: { count: number; activeIndex: number }) => {
  if (input.count <= 1) {
    return null
  }
  return (
    <div
      className='flex items-center justify-center space-x-2'
      role='tablist'
      aria-label='Pagination Dots'
      data-testid={PAGINATION_DOTS_TEST_ID}
    >
      {Array.from({ length: input.count }, (_, i) => {
        return (
          <div
            key={i}
            className={cn('size-2 rounded-full', i === input.activeIndex ? 'bg-white' : 'bg-neutral-500')}
            role='tab'
            aria-selected={i === input.activeIndex}
            aria-label={`Page ${i + 1}`}
          />
        )
      })}
    </div>
  )
}

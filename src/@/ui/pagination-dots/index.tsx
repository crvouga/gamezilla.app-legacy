import { cn } from '../cn'
import { DynamicElement } from '../dynamic-element'

export const PAGINATION_DOTS_TEST_ID = 'pagination-dots'

export const toPaginationDotSelector = (index: number) => `[data-pagination-dot-index="${index}"]`

export const PaginationDots = (input: { count: number; activeIndex: number; onClick?: (index: number) => void }) => {
  if (input.count <= 1) return null

  return (
    <div
      className='flex items-center justify-center space-x-2'
      role='tablist'
      aria-label='Pagination Dots'
      data-testid={PAGINATION_DOTS_TEST_ID}
    >
      {Array.from({ length: input.count }, (_, i) => {
        const element = input.onClick ? 'button' : 'div'
        return (
          <DynamicElement
            key={i}
            element={element}
            className={cn(
              'size-2 rounded-full',
              i === input.activeIndex ? 'bg-white' : 'bg-neutral-500',
              input.onClick && 'clickable',
            )}
            role='tab'
            onClick={input.onClick ? () => input.onClick?.(i) : undefined}
            data-pagination-dot-index={i}
            aria-selected={i === input.activeIndex}
            aria-label={`Page ${i + 1}`}
          />
        )
      })}
    </div>
  )
}

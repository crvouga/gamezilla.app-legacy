import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Clickable } from '../clickable'
import { cn } from '../cn'

export const PAGINATION_DOTS_TEST_ID = 'pagination-dots'

export const toPaginationDotSelector = (index: number) => `[aria-label="pagination dot ${index + 1}"]`

export const PaginationDots = (input: { count: number; activeIndex: number; onPress?: (index: number) => void }) => {
  if (input.count <= 1) return null

  return h(
    Box,
    {
      class: 'flex flex-row items-center justify-center space-x-2',
      role: 'tablist',
      'aria-label': 'Pagination Dots',
      'data-testid': PAGINATION_DOTS_TEST_ID,
    },
    Array.from({ length: input.count }, (_, i) => {
      if (input.onPress) {
        return h(Clickable, {
          role: 'tab',
          class: cn('size-2 rounded-full', i === input.activeIndex ? 'bg-white' : 'bg-neutral-500'),
          'aria-label': `pagination dot ${i + 1}`,
          onPress: () => input.onPress?.(i),
        })
      }
      return h(Box, {
        role: 'tab',
        class: cn('size-2 rounded-full', i === input.activeIndex ? 'bg-white' : 'bg-neutral-500'),
        'aria-label': `pagination dot ${i + 1}`,
        'aria-selected': i === input.activeIndex,
        onPress: () => input.onPress?.(i),
      })
    }),
  )
}

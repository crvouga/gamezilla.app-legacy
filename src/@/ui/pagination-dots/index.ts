import { AriaRole } from '~/@/html/aria-role'
import { Box } from '~/@/vdom/primitives/box'
import { h } from '~/@/vdom/h'
import { Clickable } from '../clickable'
import { cn } from '../cn'

export const PAGINATION_DOTS_TEST_ID = 'pagination-dots'

export const toPaginationDotSelector = (index: number) => `[data-pagination-dot-index="${index}"]`

export const PaginationDots = (input: {
  count: number
  activeIndex: number
  onPressDown?: (index: number) => void
}) => {
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
      const baseProps = {
        class: cn('size-2 rounded-full', i === input.activeIndex ? 'bg-white' : 'bg-neutral-500'),
        role: AriaRole.of('tab'),
        'data-pagination-dot-index': i,
        'aria-selected': i === input.activeIndex,
        'aria-label': `Page ${i + 1}`,
      }
      if (input.onPressDown) {
        return h(Clickable, { ...baseProps, onPressDown: () => input.onPressDown?.(i) })
      }
      return h(Box, {
        ...baseProps,
        'aria-selected': baseProps['aria-selected'] ? 'true' : 'false',
        onPressDown: () => input.onPressDown?.(i),
      })
    }),
  )
}

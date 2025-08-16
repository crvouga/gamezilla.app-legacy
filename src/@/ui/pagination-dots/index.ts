import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Clickable } from '../clickable'
import { sx } from '../../vdom/style/sx'

export const PAGINATION_DOTS_TEST_ID = 'pagination-dots'

export const toPaginationDotSelector = (index: number) => `[aria-label="pagination dot ${index + 1}"]`

export const PaginationDots = (input: { count: number; activeIndex: number; onPress?: (index: number) => void }) => {
  if (input.count <= 1) return null

  return h(
    Box,
    {
      style: sx({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }),
      role: 'tablist',
      'aria-label': 'Pagination Dots',
      'data-testid': PAGINATION_DOTS_TEST_ID,
    },
    Array.from({ length: input.count }, (_, i) => {
      if (input.onPress) {
        return h(Clickable, {
          role: 'tab',
          style: {
            ...sx({
              size: 2,
              rounded: 'full',
            }),
            backgroundColor: i === input.activeIndex ? 'rgb(255 255 255)' : 'rgb(115 115 115)',
          },
          'aria-label': `pagination dot ${i + 1}`,
          onPress: () => input.onPress?.(i),
        })
      }
      return h(Box, {
        role: 'tab',
        style: {
          ...sx({
            size: 2,
            rounded: 'full',
          }),
          backgroundColor: i === input.activeIndex ? 'rgb(255 255 255)' : 'rgb(115 115 115)',
        },
        'aria-label': `pagination dot ${i + 1}`,
        'aria-selected': i === input.activeIndex,
        onPress: () => input.onPress?.(i),
      })
    }),
  )
}

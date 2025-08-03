import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { theme } from '../theme/theme'

export const SwiperDots = (input: { activeIndex: number; slideCount: number }) => {
  return h(
    Box,
    {
      style: theme({
        flexDirection: 'row',
      }),
    },
    range(input.slideCount).map((index) =>
      h(Box, {
        key: index,
        style: {
          ...theme({
            height: 2,
            width: 2,
            rounded: 'full',
          }),
          backgroundColor: input.activeIndex === index ? 'neutral-500' : 'neutral-300',
        },
      }),
    ),
  )
}

const range = (end: number) => {
  const arr = []
  for (let i = 0; i < end; i++) {
    arr.push(i)
  }
  return arr
}

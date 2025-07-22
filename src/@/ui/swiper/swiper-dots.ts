import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'

export const SwiperDots = (input: { activeIndex: number; slideCount: number }) => {
  return h(
    Box,
    {},
    range(input.slideCount).map((index) =>
      h(Box, {
        key: index,
        class: `mx-1 h-2 w-2 rounded-full bg-neutral-300 ${input.activeIndex === index ? 'bg-neutral-500' : ''}`,
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

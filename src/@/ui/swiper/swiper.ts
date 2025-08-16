import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { sx } from '../../vdom/style/sx'

const Container = (input: {
  id: string
  onSlideIndexChanged?: (index: number) => void
  children?: VDom
  slideIndex: number
  style?: Record<string, unknown>
}) => {
  return h(
    Box,
    {
      style: {
        ...input.style,
        ...sx({
          flexDirection: 'row',
          height: 'full',
          width: 'full',
          alignItems: 'center',
          justifyContent: 'center',
        }),
      },
    },
    [input.children],
  )
}

const Slide = (input: { children?: VDom; style?: Record<string, unknown> }) => {
  return h(
    Box,
    {
      style: {
        ...input.style,
        ...sx({
          flexDirection: 'col',
          height: 'full',
          width: 'full',
          alignItems: 'center',
          justifyContent: 'center',
        }),
      },
    },
    [input.children],
  )
}

export const Swiper = {
  Container,
  Slide,
}

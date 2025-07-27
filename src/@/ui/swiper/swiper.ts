import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'

const Container = (input: {
  id: string
  onSlideIndexChanged?: (index: number) => void
  children?: VDom
  class?: string
  slideIndex: number
}) => {
  return h(Box, { class: input.class }, [input.children])
}

const Slide = (input: { children?: VDom; class?: string }) => {
  return h(Box, { class: input.class }, [input.children])
}

export const Swiper = {
  Container,
  Slide,
}

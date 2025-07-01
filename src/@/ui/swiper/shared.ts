import { Sub } from '~/@/sub'
import type { VDom } from '~/@/vdom/vdom'

export type PrivateSwiperInput = {
  id: string
  onSlideIndexChanged: (index: number) => void
  children?: VDom
  class?: string
  slideIndex: number
}

export type SwiperInput = PrivateSwiperInput & {
  children?: VDom
}

export const swiperInput = Sub.create<SwiperInput>()

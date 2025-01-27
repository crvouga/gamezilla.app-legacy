import { PubSub } from '~/@/sub'
import type { VDomChildren } from '~/@/vdom/vdom'

export type PrivateSwiperInput = {
  id: string
  onSlideIndexChanged: (index: number) => void
  children?: VDomChildren
  className?: string
  slideIndex: number
}

export type SwiperInput = PrivateSwiperInput & {
  children?: VDomChildren
}

export const swiperInput = PubSub.create<SwiperInput>()

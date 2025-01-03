import { VDomChildren } from '~/@/vdom/vdom'
import { swiperInput, SwiperInput } from './shared'
import './swiper-web-component'

const Container = (input: SwiperInput) => {
  swiperInput.pub(input)
  return (
    // @ts-expect-error
    <swiper-container id={input.id} className={input.className} initial-slide={input.slideIndex}>
      {input.children}
      {/* @ts-expect-error */}
    </swiper-container>
  )
}

const Slide = (input: { children?: VDomChildren; className?: string }) => {
  // @ts-expect-error
  return <swiper-slide className={input.className}>{input.children}</swiper-slide>
}

export const Swiper = {
  Container,
  Slide
}

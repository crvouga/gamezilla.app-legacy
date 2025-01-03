import { VDomChildren } from '~/@/vdom/vdom'
import { swiperInput, SwiperInput } from './shared'
import './swiper-element'

const Container = (input: SwiperInput) => {
  swiperInput.pub(input)
  return (
    // @ts-ignore
    <swiper-element id={input.id} className={input.className} initial-slide={input.slideIndex}>
      {input.children}
      {/* @ts-ignore */}
    </swiper-element>
  )
}

const Slide = (input: { children?: VDomChildren; className?: string }) => {
  return <div className={input.className}>{input.children}</div>
}

export const Swiper = {
  Container,
  Slide
}

import { h } from '~/@/vdom/h'
import { FloatingLayoutMobile } from './floating-layout-mobile'
import { FloatingLayoutProps } from './floating-layout-props'
import { FloatingLayoutTablet } from './floating-layout-tablet'

export const FloatingLayout = (props: FloatingLayoutProps) => {
  switch (props.ctx.screenSize) {
    case 'mobile':
      return h(FloatingLayoutMobile, props)
    case 'tablet':
    case 'desktop':
      return h(FloatingLayoutTablet, props)
  }
}

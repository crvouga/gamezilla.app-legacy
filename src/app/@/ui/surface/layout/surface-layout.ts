import { h } from '~/@/vdom/h'
import { SurfaceLayoutMobile } from './surface-layout-mobile'
import { SurfaceLayoutProps } from './surface-layout-props'
import { SurfaceLayoutTablet } from './surface-layout-tablet'

export const SurfaceLayout = (props: SurfaceLayoutProps) => {
  switch (props.ctx.screenSize) {
    case 'mobile':
      return h(SurfaceLayoutMobile, props)
    case 'tablet':
      return h(SurfaceLayoutTablet, props)
  }
}

import { v } from '~/@/vdom/v'
import { SurfaceLayoutMobile } from './surface-layout-mobile'
import { SurfaceLayoutProps } from './surface-layout-props'
import { SurfaceLayoutTablet } from './surface-layout-tablet'

export const SurfaceLayout = (props: SurfaceLayoutProps) => {
  switch (props.ctx.screenSize) {
    case 'mobile':
      return v(SurfaceLayoutMobile, props)
    case 'tablet':
      return v(SurfaceLayoutTablet, props)
  }
}

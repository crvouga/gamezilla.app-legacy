import { SurfaceLayoutMobile } from './surface-layout-mobile'
import { SurfaceLayoutProps } from './surface-layout-props'
import { SurfaceLayoutTablet } from './surface-layout-tablet'

export const SurfaceLayout = (props: SurfaceLayoutProps) => {
  switch (props.ctx.screenSize) {
    case 'mobile':
      return SurfaceLayoutMobile(props)
    case 'tablet':
      return SurfaceLayoutTablet(props)
  }
}

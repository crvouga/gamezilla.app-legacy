import { SurfaceLayoutMobile } from './mobile'
import { SurfaceLayoutProps } from './props'
import { SurfaceLayoutTablet } from './tablet'

export const SurfaceLayout = (props: SurfaceLayoutProps) => {
  switch (props.ctx.screenSize) {
    case 'mobile':
      return <SurfaceLayoutMobile {...props} />
    case 'tablet':
      return <SurfaceLayoutTablet {...props} />
  }
}

import { SurfaceLayoutMobile } from './mobile'
import { SurfaceLayoutProps } from './props'

export const SurfaceLayoutTablet = (props: SurfaceLayoutProps) => {
  return <SurfaceLayoutMobile {...props} />
}

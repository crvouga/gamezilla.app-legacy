import { ScreenLayoutMobile } from './screen-layout-mobile'
import { ScreenLayoutProps } from './screen-layout-props'
import { ScreenLayoutTablet } from './screen-layout-tablet'

export const ScreenLayout = (input: ScreenLayoutProps) => {
  const isMobile = true
  if (isMobile) return <ScreenLayoutMobile {...input} />
  return <ScreenLayoutTablet {...input} />
}

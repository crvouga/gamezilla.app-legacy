import { ScreenLayoutMobile } from './mobile'
import { ScreenLayoutProps } from './props'
import { ScreenLayoutTablet } from './tablet'

export const ScreenLayout = (input: ScreenLayoutProps) => {
  const isMobile = true
  if (isMobile) return <ScreenLayoutMobile {...input} />
  return <ScreenLayoutTablet {...input} />
}

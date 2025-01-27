import { ScreenLayoutMobile } from './screen-layout-mobile'
import { ScreenLayoutProps } from './screen-layout-props'

export const ScreenLayoutTablet = (input: ScreenLayoutProps) => {
  return <ScreenLayoutMobile {...input} />
}

import { ScreenLayoutMobile } from './mobile'
import { ScreenLayoutProps } from './props'

export const ScreenLayoutTablet = (input: ScreenLayoutProps) => {
  return <ScreenLayoutMobile {...input} />
}

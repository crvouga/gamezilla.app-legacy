import { ScreenLayoutMobile } from './screen-layout-mobile'
import { ScreenLayoutProps } from './screen-layout-props'
import { ScreenLayoutTablet } from './screen-layout-tablet'

export const ScreenLayout = (input: ScreenLayoutProps) => {
  switch (input.ctx.screenSize) {
    case 'mobile':
      return <ScreenLayoutMobile {...input} />
    case 'tablet':
      return <ScreenLayoutTablet {...input} />
  }
}

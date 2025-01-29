import { ScreenLayoutMobile } from './mobile'
import { ScreenLayoutProps } from './props'
import { ScreenLayoutTablet } from './tablet'

export const ScreenLayout = (input: ScreenLayoutProps) => {
  switch (input.ctx.screenSize) {
    case 'mobile':
      return <ScreenLayoutMobile {...input} />
    case 'tablet':
      return <ScreenLayoutTablet {...input} />
  }
}

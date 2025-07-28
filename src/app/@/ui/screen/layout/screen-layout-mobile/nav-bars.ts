import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { ScreenNavBarMobile } from './screen-nav-bar-mobile'
import { ParentScreenProps, ScreenLayoutProps } from '../screen-layout-props'

export const renderNavBars = (ctx: ScreenLayoutProps['ctx'], screen: ParentScreenProps | null): VDom[] => {
  if (!screen) return []
  const bars = []
  if (screen.navBar) {
    bars.push(
      h(ScreenNavBarMobile, {
        key: screen.id,
        ctx: ctx,
        back: screen.navBar.back,
        title: screen.navBar.title,
        subtitle: screen.navBar.subtitle,
      }),
    )
  }
  if (screen.parentScreen) {
    bars.push(...renderNavBars(ctx, screen.parentScreen))
  }
  return bars
}

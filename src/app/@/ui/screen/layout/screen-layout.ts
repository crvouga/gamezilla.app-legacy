import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Frag } from '~/@/vdom/primitives/frag'
import { ScreenLayoutMobile } from './screen-layout-mobile'
import { ScreenLayoutProps, toDataTestIds } from './screen-layout-props'
import { ScreenLayoutTablet } from './screen-layout-tablet'

export const ScreenLayout = (input: ScreenLayoutProps) => {
  return h(Frag, {}, [
    ...toDataTestIds(input).map((dataTestId) => h(Box, { key: dataTestId, 'data-testid': dataTestId })),
    h(ScreenLayoutVariant, input, []),
  ])
}

const ScreenLayoutVariant = (input: ScreenLayoutProps) => {
  switch (input.ctx.screenSize) {
    case 'mobile':
      return h(ScreenLayoutMobile, input)
    case 'tablet':
      return h(ScreenLayoutTablet, input)
  }
}

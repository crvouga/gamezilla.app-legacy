import { Frag } from '~/@/vdom/primitives/frag'
import { Box } from '~/@/vdom/primitives/box'
import { h } from '~/@/vdom/h'
import { ScreenLayoutProps, toDataTestIds } from './screen-layout-props'
import { ScreenLayoutTablet } from './screen-layout-tablet'
import { ScreenLayoutMobile } from './screen-layout-mobile'

export const ScreenLayout = (input: ScreenLayoutProps) => {
  return h(Frag, {}, [
    ...toDataTestIds(input).map((dataTestId) =>
      h(Box, { key: dataTestId, class: 'hidden', 'data-testid': dataTestId }),
    ),
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

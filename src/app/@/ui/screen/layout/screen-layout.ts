import { Frag } from '~/@/ui/frag'
import { h } from '~/@/vdom/h'
import { ScreenLayoutMobile } from './screen-layout-mobile'
import { ScreenLayoutProps, toDataTestIds } from './screen-layout-props'
import { ScreenLayoutTablet } from './screen-layout-tablet'

export const ScreenLayout = (input: ScreenLayoutProps) => {
  return h(Frag, {}, [
    ...toDataTestIds(input).map((dataTestId) =>
      h('div', {
        key: dataTestId,
        class: 'hidden',
        'data-testid': dataTestId,
      }),
    ),
    h(ScreenLayoutVariant, input),
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

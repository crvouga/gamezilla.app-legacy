import { Frag } from '~/@/ui/frag'
import { v } from '~/@/vdom/v'
import { ScreenLayoutMobile } from './screen-layout-mobile'
import { ScreenLayoutProps, toDataTestIds } from './screen-layout-props'
import { ScreenLayoutTablet } from './screen-layout-tablet'

export const ScreenLayout = (input: ScreenLayoutProps) => {
  return v(Frag, null, [
    ...toDataTestIds(input).map((dataTestId) =>
      v('div', {
        key: dataTestId,
        className: 'hidden',
        'data-testid': dataTestId,
      }),
    ),
    v(ScreenLayoutVariant, input),
  ])
}

const ScreenLayoutVariant = (input: ScreenLayoutProps) => {
  switch (input.ctx.screenSize) {
    case 'mobile':
      return v(ScreenLayoutMobile, input)
    case 'tablet':
      return v(ScreenLayoutTablet, input)
  }
}

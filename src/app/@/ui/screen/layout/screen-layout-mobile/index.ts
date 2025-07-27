import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { ScreenLayoutProps } from '../screen-layout-props'
import { PatchAction } from './patch-action'
import { PostAction } from './post-action'
import { renderActionBars } from './render-action-bars'
import { renderNavBars } from './render-nav-bars'

export const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
  return h(Box, { class: 'flex w-full h-full flex-col overflow-hidden' }, [
    ...renderActionBars(input.ctx, input, 'top'),

    h(Box, { class: 'flex flex-1 flex-col overflow-hidden' }, [
      ...renderNavBars(input.ctx, input),

      h(Box, { class: 'relative flex w-full flex-1 flex-col overflow-hidden' }, [
        input.renderBody(),
        h(PostAction, input, []),
      ]),

      h(PatchAction, input, []),
    ]),

    ...renderActionBars(input.ctx, input, 'bottom'),
  ])
}

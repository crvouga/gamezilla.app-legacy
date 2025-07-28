import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { ScreenLayoutProps } from '../screen-layout-props'
import { EditAction } from './edit-action'
import { CreateAction } from './create-action'
import { renderActionBars } from './action-bars'
import { renderNavBars } from './nav-bars'

export const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
  return h(Box, { class: 'flex w-full h-full flex-col' }, [
    ...renderActionBars(input.ctx, input, 'top'),

    h(Box, { class: 'flex flex-1 flex-col' }, [
      ...renderNavBars(input.ctx, input),

      h(Box, { class: 'relative flex w-full flex-1 flex-col' }, [input.renderBody(), h(CreateAction, input, [])]),

      h(EditAction, input, []),
    ]),

    ...renderActionBars(input.ctx, input, 'bottom'),
  ])
}

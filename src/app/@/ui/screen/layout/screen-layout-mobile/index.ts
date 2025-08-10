import { sx } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { ScreenLayoutProps } from '../screen-layout-props'
import { renderActionBars } from './action-bars'
import { CreateAction } from './create-action'
import { EditAction } from './edit-action'
import { renderMiniPlayers } from './mini-players'
import { renderNavBars } from './nav-bars'

export const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
  return h(
    Box,
    {
      style: sx({
        flex: 1,
        flexDirection: 'col',
        width: 'full',
        overflow: 'hidden',
      }),
    },
    [
      ...renderActionBars(input.ctx, input, 'top'),
      ...renderMiniPlayers(input.ctx, input, 'top'),
      h(
        Box,
        {
          style: sx({
            flex: 1,
            flexDirection: 'col',
            overflow: 'hidden',
          }),
        },
        [
          ...renderNavBars(input.ctx, input),

          h(
            Box,
            {
              style: sx({
                flex: 1,
                flexDirection: 'col',
                overflow: 'hidden',
                position: 'relative',
              }),
            },
            [input.renderBody(), h(CreateAction, input, [])],
          ),

          h(EditAction, input, []),
        ],
      ),
      ...renderMiniPlayers(input.ctx, input, 'bottom'),
      ...renderActionBars(input.ctx, input, 'bottom'),
    ],
  )
}

import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { sx } from '~/@/vdom/style/sx'
import { ScreenLayoutProps } from '../screen-layout-props'
import { ActionBars } from './action-bars'
import { MiniPlayers } from './mini-players'
import { renderNavBars } from './nav-bars'

export const ScreenLayoutTablet = (props: ScreenLayoutProps) => {
  return h(
    Box,
    {
      style: sx({
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'full',
        flex: 1,
        overflow: 'hidden',
      }),
    },
    [
      h(ActionBars, { ...props, position: 'start' }),

      h(
        Box,
        {
          style: sx({
            flex: 4,
            borderXWidth: 1,
            borderColor: 'neutral-500',
            maxWidth: '5xl',
            height: 'full',
            display: 'flex',
            flexDirection: 'col',
          }),
        },
        [
          ...renderNavBars(props.ctx, props),

          h(Box, { style: sx({ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'col' }) }, [
            props.renderBody(),
            h(MiniPlayers, props),
          ]),
        ],
      ),

      h(ActionBars, { ...props, position: 'end' }),
    ],
  )
}

import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { ParentScreenProps, ScreenLayoutProps } from '../screen-layout-props'
import { ActionBars } from './action-bars'
import { renderNavBars } from './nav-bars'
import { sx } from '~/@/ui/theme/theme'

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
          }),
        },
        [
          ...renderNavBars(props.ctx, props),

          h(Box, { style: sx({ flex: 1, overflow: 'hidden' }) }, [
            props.renderBody(),
            (props.renderMiniPlayer || props.parentScreen?.renderMiniPlayer) &&
              h(Box, { style: sx({ position: 'absolute', right: 8, bottom: 8, backgroundColor: 'black' }) }, [
                ...renderMiniPlayers(props),
              ]),
          ]),
        ],
      ),

      h(ActionBars, { ...props, position: 'end' }),
    ],
  )
}

const renderMiniPlayers = (screen: ParentScreenProps | null): VDom[] => {
  if (!screen) return []
  const players = []
  if (screen.renderMiniPlayer) {
    players.push(screen.renderMiniPlayer({ key: screen.id }))
  }
  if (screen.parentScreen) {
    players.push(...renderMiniPlayers(screen.parentScreen))
  }
  return players
}

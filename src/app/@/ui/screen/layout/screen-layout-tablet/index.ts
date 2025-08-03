import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { ParentScreenProps, ScreenLayoutProps } from '../screen-layout-props'
import { ActionBars } from './action-bars'
import { renderNavBars } from './nav-bars'
import { theme } from '~/@/ui/theme/theme'

export const ScreenLayoutTablet = (input: ScreenLayoutProps) => {
  return h(
    Box,
    {
      style: theme({
        position: 'relative',
        flexDirection: 'row',
        width: 'full',
        flex: 1,
        overflow: 'hidden',
      }),
    },
    [
      h(ActionBars, { position: 'start', input: input }),

      h(Box, { style: theme({ flex: 4, borderWidth: 1 }) }, [
        ...renderNavBars(input.ctx, input),

        h(Box, { style: theme({ flex: 1, overflow: 'hidden' }) }, [
          input.renderBody(),
          (input.renderMiniPlayer || input.parentScreen?.renderMiniPlayer) &&
            h(Box, { style: theme({ position: 'absolute', right: 8, bottom: 8, backgroundColor: 'black' }) }, [
              ...renderMiniPlayers(input),
            ]),
        ]),
      ]),

      h(ActionBars, { position: 'end', input: input }),
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

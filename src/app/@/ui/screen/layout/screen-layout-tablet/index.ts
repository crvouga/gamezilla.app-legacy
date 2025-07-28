import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { ParentScreenProps, ScreenLayoutProps } from '../screen-layout-props'
import { ActionBars } from './action-bars'
import { renderNavBars } from './nav-bars'

export const ScreenLayoutTablet = (input: ScreenLayoutProps) => {
  return h(
    Box,
    {
      class: 'relative flex flex-row w-full flex-1 flex-row overflow-hidden',
    },
    [
      h(ActionBars, { position: 'start', input: input }),

      h(Box, { class: 'flex max-w-3xl flex-[4] shrink-0 flex-col border-x' }, [
        ...renderNavBars(input.ctx, input),

        h(Box, { class: 'flex w-full flex-1 flex-col overflow-hidden' }, [
          input.renderBody(),
          (input.renderMiniPlayer || input.parentScreen?.renderMiniPlayer) &&
            h(Box, { class: 'absolute right-8 bottom-8 bg-black' }, [...renderMiniPlayers(input)]),
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

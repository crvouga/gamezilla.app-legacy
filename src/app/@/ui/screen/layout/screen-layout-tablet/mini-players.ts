import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Portal } from '~/@/vdom/primitives/portal'
import { sx } from '~/@/vdom/style/sx'
import { VDom } from '~/@/vdom/vdom'
import { ParentScreenProps, ScreenLayoutProps } from '../screen-layout-props'

export const MiniPlayers = (props: ScreenLayoutProps) => {
  if (!(props.renderMiniPlayer || props.parentScreen?.renderMiniPlayer)) return null
  return h(Portal.Entrance, {}, [
    h(
      Box,
      {
        style: sx({
          position: 'absolute',
          right: 8,
          bottom: 8,
          backgroundColor: 'black',
        }),
      },
      renderMiniPlayers(props),
    ),
  ])
}

const renderMiniPlayers = (screen: ParentScreenProps | null): VDom[] => {
  const players = []

  if (screen?.renderMiniPlayer) {
    players.push(screen.renderMiniPlayer({ key: screen.id }))
  }

  if (screen?.parentScreen) {
    players.push(...renderMiniPlayers(screen.parentScreen))
  }

  return players
}

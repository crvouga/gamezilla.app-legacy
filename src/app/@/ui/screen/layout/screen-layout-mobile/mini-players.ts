import { VDom } from '~/@/vdom/vdom'
import { ParentScreenProps, ScreenLayoutProps } from '../screen-layout-props'

export const renderMiniPlayers = (
  ctx: ScreenLayoutProps['ctx'],
  screen: ParentScreenProps | null,
  position: 'top' | 'bottom',
): VDom[] => {
  if (!screen) return []
  const bars = []
  if (screen.actionBar) {
    const barPosition = screen.actionBar.position ?? 'bottom'
    const id = screen.actionBar.id ?? `${screen.id}-${barPosition}-actions`

    if (barPosition === position) {
      bars.push(screen.renderMiniPlayer?.({ key: `${id}-mini-player` }))
    }
  }
  if (screen.parentScreen) {
    bars.push(...renderMiniPlayers(ctx, screen.parentScreen, position))
  }
  return bars
}

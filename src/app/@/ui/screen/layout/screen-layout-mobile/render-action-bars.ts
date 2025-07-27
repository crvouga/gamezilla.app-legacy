import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { HorizontalActionBar } from '../../action-bar/screen-action-bar-horizontal'
import { ParentScreenProps, ScreenLayoutProps } from '../screen-layout-props'

export const renderActionBars = (
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
      bars.push(
        h(Box, { key: id }, [
          screen.renderMiniPlayer?.({ key: `${id}-mini-player` }),
          h(HorizontalActionBar, { ...screen.actionBar, id, ctx, key: id }),
        ]),
      )
    }
  }
  if (screen.parentScreen) {
    bars.push(...renderActionBars(ctx, screen.parentScreen, position))
  }
  return bars
}

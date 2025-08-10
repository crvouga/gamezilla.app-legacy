import { sx } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { VerticalActionBar } from '../../action-bar/screen-action-bar-vertical'
import { ParentScreenProps, ScreenLayoutProps } from '../screen-layout-props'

export const ActionBars = (props: ScreenLayoutProps & { position: 'start' | 'end' }) => {
  const actionBars = renderActionBars(props.ctx, props, props.position)

  return h(
    Box,
    {
      style: sx({
        flexDirection: 'row',
        height: 'full',
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: props.position === 'start' ? 'flex-end' : 'flex-start',
      }),
    },
    actionBars,
  )
}

const renderActionBars = (
  ctx: ScreenLayoutProps['ctx'],
  screen: ParentScreenProps | null,
  position: 'start' | 'end',
): VDom[] => {
  if (!screen) return []

  const bars = []

  if (screen.actionBar) {
    const isTopLevel = !Boolean(screen.parentScreen)
    const shouldRenderStart = position === 'start' && isTopLevel
    const shouldRenderEnd = position === 'end' && !isTopLevel

    if (shouldRenderStart || shouldRenderEnd) {
      const id = screen.actionBar.id ?? `${screen.id}-actions`

      bars.push(
        h(VerticalActionBar, {
          ...screen.actionBar,
          key: id,
          id,
          ctx,
        }),
      )
    }
  }

  if (screen.parentScreen) {
    bars.push(...renderActionBars(ctx, screen.parentScreen, position))
  }

  return bars
}

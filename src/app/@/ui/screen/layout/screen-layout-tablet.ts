import { Button } from '~/@/ui/button'
import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { VerticalActionBar } from '../action-bar/screen-action-bar-vertical'
import { ScreenNavBarTablet } from '../nav-bar/screen-nav-bar-tablet'
import { ParentScreenProps, ScreenLayoutProps } from './screen-layout-props'

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

const ActionBars = (props: { position: 'start' | 'end'; input: ScreenLayoutProps }) => {
  const actionBars = renderActionBars(props.input.ctx, props.input, props.position)

  return h(
    Box,
    {
      class: cn(
        'flex flex-row h-full flex-1 flex-row items-start',
        props.position === 'start' ? 'justify-end' : 'justify-start',
      ),
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
      const class_ = position === 'start' ? 'order-first' : 'order-last'

      bars.push(
        h(VerticalActionBar, {
          ...screen.actionBar,
          id: id,
          ctx: ctx,
          key: id,
          class: class_,
        }),
      )
    }
  }

  if (screen.parentScreen) {
    bars.push(...renderActionBars(ctx, screen.parentScreen, position))
  }

  return bars
}

const renderNavBars = (ctx: ScreenLayoutProps['ctx'], screen: ParentScreenProps | null): VDom[] => {
  if (!screen) return []
  const bars = []
  if (screen.navBar) {
    bars.push(
      ScreenNavBarTablet({
        key: screen.id,
        ctx: ctx,
        back: screen.navBar.back,
        title: screen.navBar.title,
        subtitle: screen.navBar.subtitle,
        renderEnd: () =>
          (screen.patchAction || screen.postAction) &&
          h(Box, { class: 'flex flex-row items-center justify-end' }, [
            screen.patchAction &&
              h(Box, { class: 'flex flex-row min-w-64 items-center justify-end' }, [
                h(CancelSubmitButtons, { ...screen.patchAction, size: 'md' }),
              ]),
            screen.postAction &&
              h(Button, {
                color: 'primary',
                fab: true,
                variant: 'contained',
                size: 'md',
                onClick: screen.postAction.onSubmit,
                disabled: screen.postAction.submitDisabled,
                loading: screen.postAction.submitLoading,
                text: screen.postAction.submitText,
                renderIconStart: screen.postAction.submitIcon,
              }),
          ]),
      }),
    )
  }
  if (screen.parentScreen) {
    bars.push(...renderNavBars(ctx, screen.parentScreen))
  }
  return bars
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

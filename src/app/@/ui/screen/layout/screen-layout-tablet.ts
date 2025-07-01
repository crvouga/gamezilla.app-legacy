import { Button } from '~/@/ui/button'
import { cn } from '~/@/ui/cn'
import { DynamicElement } from '~/@/ui/dynamic-element'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { VerticalActionBar } from '../action-bar/screen-action-bar-vertical'
import { ScreenNavBarTablet } from '../nav-bar/screen-nav-bar-tablet'
import { ParentScreenProps, ScreenLayoutProps } from './screen-layout-props'

export const ScreenLayoutTablet = (input: ScreenLayoutProps) => {
  const element = input.patchAction ? 'form' : 'div'

  return h(
    DynamicElement,
    {
      element: element,
      className: 'relative flex w-full flex-1 flex-row overflow-hidden',
      onSubmit: (e) => {
        e.preventDefault()
        input.patchAction?.onSubmit()
      },
    },
    [
      h(ActionBars, { position: 'start', input: input }),

      h('div', { className: 'flex max-w-3xl flex-[4] shrink-0 flex-col border-x' }, [
        ...renderNavBars(input.ctx, input),

        h('div', { className: 'flex w-full flex-1 flex-col overflow-hidden' }, [
          input.renderBody(),
          (input.renderMiniPlayer || input.parentScreen?.renderMiniPlayer) &&
            h('div', { className: 'absolute right-8 bottom-8 bg-black' }, [...renderMiniPlayers(input)]),
        ]),
      ]),

      h(ActionBars, { position: 'end', input: input }),
    ],
  )
}

const ActionBars = (props: { position: 'start' | 'end'; input: ScreenLayoutProps }) => {
  const actionBars = renderActionBars(props.input.ctx, props.input, props.position)

  return h(
    'div',
    {
      className: cn(
        'flex h-full flex-1 flex-row items-start',
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
      const className = position === 'start' ? 'order-first' : 'order-last'

      bars.push(
        h(VerticalActionBar, {
          ...screen.actionBar,
          id: id,
          ctx: ctx,
          key: id,
          className: className,
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
      h(ScreenNavBarTablet, {
        key: screen.id,
        ctx: ctx,
        back: screen.navBar.back,
        title: screen.navBar.title,
        subtitle: screen.navBar.subtitle,
        renderEnd: () =>
          (screen.patchAction || screen.postAction) &&
          h('div', { className: 'flex items-center justify-end' }, [
            screen.patchAction &&
              h('div', { className: 'flex min-w-64 items-center justify-end' }, [
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

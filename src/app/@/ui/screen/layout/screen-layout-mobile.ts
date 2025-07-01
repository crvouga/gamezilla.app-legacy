import { Button } from '~/@/ui/button'
import { DynamicElement } from '~/@/ui/dynamic-element'
import { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { HorizontalActionBar } from '../action-bar/screen-action-bar-horizontal'
import { ScreenNavBarMobile } from '../nav-bar/screen-nav-bar-mobile'
import { ParentScreenProps, ScreenLayoutProps } from './screen-layout-props'

export const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
  const element = input.patchAction ? 'form' : 'div'

  return h(
    DynamicElement,
    {
      element: element,
      class: 'flex w-full flex-1 flex-col overflow-hidden',
      onSubmit: (e) => {
        e.preventDefault()
        input.patchAction?.onSubmit()
      },
    },
    [
      ...renderActionBars(input.ctx, input),

      h('div', { class: 'flex flex-1 flex-col overflow-hidden' }, [
        ...renderNavBars(input.ctx, input),

        h('div', { class: 'relative flex w-full flex-1 flex-col overflow-hidden' }, [
          input.renderBody(),

          input.postAction &&
            h('div', { class: 'absolute right-4 bottom-6' }, [
              h(Button, {
                color: 'primary',
                size: 'lg',
                variant: 'contained',
                fab: true,
                onClick: input.postAction.onSubmit,
                disabled: input.postAction.submitDisabled,
                loading: input.postAction.submitLoading,
                text: input.postAction.submitText,
                renderIconStart: input.postAction.submitIcon,
              }),
            ]),
        ]),

        input.patchAction && h(CancelSubmitButtons, input.patchAction),
      ]),
    ],
  )
}

const renderActionBars = (ctx: ScreenLayoutProps['ctx'], screen: ParentScreenProps | null): VDom[] => {
  if (!screen) return []
  const bars = []
  if (screen.actionBar) {
    const position = screen.actionBar.position ?? 'bottom'
    const id = screen.actionBar.id ?? `${screen.id}-${position}-actions`
    bars.push(
      h(
        'div',
        {
          key: id,
          class: position === 'top' ? 'order-first' : 'order-last',
        },
        [
          screen.renderMiniPlayer?.({ key: `${id}-mini-player` }),
          h(HorizontalActionBar, {
            ...screen.actionBar,
            id: id,
            ctx: ctx,
            key: id,
          }),
        ],
      ),
    )
  }
  if (screen.parentScreen) {
    bars.push(...renderActionBars(ctx, screen.parentScreen))
  }
  return bars
}

const renderNavBars = (ctx: ScreenLayoutProps['ctx'], screen: ParentScreenProps | null): VDom[] => {
  if (!screen) return []
  const bars = []
  if (screen.navBar) {
    bars.push(
      h(ScreenNavBarMobile, {
        key: screen.id,
        ctx: ctx,
        back: screen.navBar.back,
        title: screen.navBar.title,
        subtitle: screen.navBar.subtitle,
      }),
    )
  }
  if (screen.parentScreen) {
    bars.push(...renderNavBars(ctx, screen.parentScreen))
  }
  return bars
}

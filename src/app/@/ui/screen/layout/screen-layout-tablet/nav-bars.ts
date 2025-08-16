import { Button } from '~/@/ui/button'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { CancelSubmitButtons } from '../../../form/cancel-submit-buttons'
import { ScreenNavBarTablet } from './screen-nav-bar-tablet'
import { ParentScreenProps, ScreenLayoutProps } from '../screen-layout-props'
import { sx } from '~/@/vdom/style/sx'

export const renderNavBars = (ctx: ScreenLayoutProps['ctx'], screen: ParentScreenProps | null): VDom[] => {
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
          (screen.actionEdit || screen.actionCreate) &&
          h(Box, { style: sx({ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }) }, [
            screen.actionEdit &&
              h(
                Box,
                {
                  style: sx({
                    flexDirection: 'row',
                    minWidth: '4xl',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }),
                },
                [h(CancelSubmitButtons, { ...screen.actionEdit, size: 'md' })],
              ),
            screen.actionCreate &&
              h(Button, {
                width: 'full',
                color: 'primary',
                fab: true,
                variant: 'contained',
                size: 'md',
                onPress: screen.actionCreate.onSubmit,
                disabled: screen.actionCreate.submitDisabled,
                loading: screen.actionCreate.submitLoading,
                text: screen.actionCreate.submitText,
                renderIconStart: screen.actionCreate.submitIcon,
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

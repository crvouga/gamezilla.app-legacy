import { Clickable } from '~/@/ui/clickable'
import { IconGear, IconLanguage } from '~/@/ui/icon'
import { MenuItem } from '~/@/ui/menu-item'
import { theme } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { SurfaceLayout } from '../@/ui/surface/layout/surface-layout'
import { BackendConnectionStatus } from '../@/wire/backend-connection-status'
import { SoundFrontend } from './sound'
import type { FrontendModule } from './types'

export const TEST_ID_TOP_BAR_SURFACE_OPEN_BUTTON = 'top-bar/surface-open-button'
export const TEST_ID_TOP_BAR_SURFACE = 'top-bar/surface'

const View: FrontendModule['View'] = (props) => {
  const iconSize: Record<string, unknown> = props.ctx.screenSize === 'mobile' ? theme({ size: 4 }) : theme({ size: 5 })
  return h(SurfaceLayout, {
    ctx: props.ctx,
    ariaLabel: props.ctx.t('status-bar.status-bar'),
    drawer: {
      position: 'top',
    },
    id: 'status-bar-drawer',
    open: props.model.isTopBarSurfaceOpen,
    onClose: () => props.dispatch({ t: 'settings.closed-top-bar-surface' }),
    dropDown: {
      reference: {
        render: () =>
          h(
            Clickable,
            {
              'data-testid': TEST_ID_TOP_BAR_SURFACE_OPEN_BUTTON,
              role: 'button',
              style:
                props.ctx.screenSize === 'mobile'
                  ? theme({
                      flexDirection: 'row',
                      width: 'full',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 3,
                      padding: 3,
                    })
                  : theme({
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 4,
                      padding: 2,
                      paddingLeft: 8,
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      zIndex: 100,
                    }),
              'aria-label': props.ctx.t('app.open-settings'),
              onPress: () => {
                props.dispatch({ t: 'settings.clicked-top-bar' })
              },
            },
            [
              h(BackendConnectionStatus.ViewDot, {
                model: props.ctx.backendConnectionStatus,
                style: iconSize,
                ctx: props.ctx,
              }),
              h(SoundFrontend.ViewIcon, {
                model: props.model.sound,
                style: { ...iconSize, ...theme({ textColor: 'white' }) },
              }),
              h(IconGear, {
                style: { ...iconSize, ...theme({ textColor: 'white' }) },
              }),
            ],
          ),
      },
    },
    body: {
      render: () =>
        h(
          Box,
          {
            'data-testid': TEST_ID_TOP_BAR_SURFACE,
            style: theme({ width: 'full', flexDirection: 'col' }),
          },
          [
            h(BackendConnectionStatus.ViewMenuItem, {
              ctx: props.ctx,
              model: props.ctx.backendConnectionStatus,
              onPress: () => {},
            }),

            h(SoundFrontend.ViewSoundMenuItem, {
              ctx: props.ctx,
              model: props.model.sound,
              dispatch: (c) => props.dispatch({ t: 'sound', c }),
            }),

            h(ViewLangMenuItem, props),

            h(MenuItem, {
              renderIcon: (inputIcon) => h(IconGear, inputIcon),
              primary: props.ctx.t('l18n.settings'),
              link: true,
              onPress: () => {
                props.dispatch({ t: 'settings.clicked-open-settings' })
              },
            }),
          ],
        ),
    },
  })
}

const ViewLangMenuItem: FrontendModule['View'] = ({ model, ctx, dispatch }) => {
  return h(MenuItem, {
    renderIcon: (iconProps) => h(IconLanguage, iconProps),
    primary: ctx.t('l18n.language'),
    renderEnd: () => h(Text, { text: ctx.t(model.lang) }),
    onPress: () => {
      dispatch({ t: 'settings.clicked-open-lang' })
    },
  })
}

export const SettingsTopBar = {
  View,
}

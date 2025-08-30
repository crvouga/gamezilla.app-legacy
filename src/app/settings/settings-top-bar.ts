import { Clickable } from '~/@/ui/clickable'
import { IconGear, IconLanguage } from '~/@/ui/icon'
import { MenuItem } from '~/@/ui/menu-item'
import { sx } from '~/@/vdom/style/sx'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { FloatingLayout } from '../@/ui/floating/layout/floating-layout'
import { BackendConnectionStatus } from '../@/wire/backend-connection-status'
import { SoundFrontend } from './sound'
import type { FrontendModule } from './types'

const View: FrontendModule['View'] = (props) => {
  const iconSize = toStyleIconSize(props)
  return h(FloatingLayout, {
    ctx: props.ctx,
    ariaLabel: props.ctx.t('status-bar.status-bar'),
    drawer: {
      position: 'top',
    },
    id: 'status-bar-drawer',
    open: props.model.isTopBarSurfaceOpen,
    onClose: () => props.dispatch({ t: 'settings.closed-top-bar-surface' }),
    style: toStyle(props),
    dropDown: {
      position: 'bottom',
      reference: {
        render: () =>
          h(
            Clickable,
            {
              role: 'button',
              style: toStyleClickable(props),
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
                style: { ...iconSize, ...sx({ textColor: 'white' }) },
              }),
              h(IconGear, {
                style: { ...iconSize, ...sx({ textColor: 'white' }) },
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
            style: sx({ width: 'full', flexDirection: 'col' }),
            role: 'menu',
            'aria-label': props.ctx.t('app.settings'),
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
              dispatch: (c) => {
                props.dispatch({ t: 'sound', c })
              },
            }),

            h(MenuItem, {
              renderIcon: (iconProps) => h(IconLanguage, iconProps),
              primary: props.ctx.t('l18n.language'),
              renderEnd: () => h(Text, { text: props.ctx.t(props.model.lang) }),
              onPress: () => {
                props.dispatch({ t: 'settings.clicked-open-lang' })
              },
            }),

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

const toStyleIconSize = (props: Parameters<FrontendModule['View']>[0]): Record<string, unknown> => {
  switch (props.ctx.screenSize) {
    case 'mobile':
      return sx({ size: 4 })
    default:
      return sx({ size: 5 })
  }
}

const toStyleClickable = (props: Parameters<FrontendModule['View']>[0]): Record<string, unknown> => {
  switch (props.ctx.screenSize) {
    case 'mobile':
      return sx({
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 3,
        padding: 3,
      })
    default:
      return sx({
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
        padding: 2,
        paddingLeft: 8,
      })
  }
}

const toStyle = (props: Parameters<FrontendModule['View']>[0]): Record<string, unknown> => {
  switch (props.ctx.screenSize) {
    case 'mobile':
      return sx({ width: 'full' })
    default:
      return sx({ position: 'absolute', top: 0, right: 0, zIndex: 50 })
  }
}

export const SettingsTopBar = {
  View,
}

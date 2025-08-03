import { Translator } from '~/@/l18n/generated'
import { TimeSpan } from '~/@/time/time-span'
import { MenuItem } from '~/@/ui/menu-item'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'

export type BackendConnectionStatus =
  | { t: 'connected'; averagePing: TimeSpan; latestPing: TimeSpan }
  | { t: 'disconnected' }
  | { t: 'connecting' }

const ViewDot = (input: { model: BackendConnectionStatus; ctx: { t: Translator }; style: Record<string, unknown> }) => {
  switch (input.model.t) {
    case 'connected': {
      return Dot({ style: { ...theme({ textColor: 'green-500' }), ...input.style } })
    }

    case 'connecting': {
      return Dot({ style: { ...theme({ textColor: 'orange-500' }), ...input.style } })
    }

    case 'disconnected': {
      return Dot({ style: { ...theme({ textColor: 'red-500' }), ...input.style } })
    }
  }
}

const ViewMenuItem = (input: { model: BackendConnectionStatus; ctx: { t: Translator }; onPress: () => void }) => {
  const { model, ctx } = input
  switch (model.t) {
    case 'connected': {
      return h(MenuItem, {
        renderIcon: (iconProps) =>
          h(Dot, { ...iconProps, style: { ...iconProps, ...theme({ textColor: 'green-500' }) } }),
        color: 'green',
        primary: ctx.t('wire.online'),
        renderEnd: () => h(Typography, { text: TimeSpan.format(model.latestPing) }),
        onPress: input.onPress,
      })
    }

    case 'connecting': {
      return h(MenuItem, {
        renderIcon: (iconProps) =>
          h(Dot, { ...iconProps, style: { ...iconProps.style, ...theme({ textColor: 'orange-500' }) } }),
        color: 'warning',
        primary: ctx.t('wire.connecting...'),
        onPress: input.onPress,
      })
    }

    case 'disconnected': {
      return h(MenuItem, {
        renderIcon: (iconProps) =>
          h(Dot, { ...iconProps, style: { ...iconProps.style, ...theme({ textColor: 'red-500' }) } }),
        color: 'danger',
        primary: ctx.t('wire.offline'),
        onPress: input.onPress,
      })
    }
  }
}

const Dot = (input: { style: Record<string, unknown> }) => {
  return h(Box, { style: { ...theme({ position: 'relative', p: 1 }), ...input.style } }, [
    h(Box, {
      style: { ...theme({ position: 'absolute', height: 'full', width: 'full', rounded: 'full' }) },
    }),
  ])
}

export const BackendConnectionStatus = {
  ViewDot,
  ViewMenuItem,
}

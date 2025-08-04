import { Translator } from '~/@/l18n/generated'
import { TimeSpan } from '~/@/time/time-span'
import { MenuItem } from '~/@/ui/menu-item'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Circle } from '~/@/vdom/primitives/svg/circle'
import { Svg } from '~/@/vdom/primitives/svg/svg'

export type BackendConnectionStatus =
  | { t: 'connected'; averagePing: TimeSpan; latestPing: TimeSpan }
  | { t: 'disconnected' }
  | { t: 'connecting' }

const ViewDot = (input: { model: BackendConnectionStatus; ctx: { t: Translator }; style: Record<string, unknown> }) => {
  switch (input.model.t) {
    case 'connected': {
      return h(Dot, { style: { ...theme({ textColor: 'green-500' }), ...input.style } })
    }

    case 'connecting': {
      return h(Dot, { style: { ...theme({ textColor: 'orange-500' }), ...input.style } })
    }

    case 'disconnected': {
      return h(Dot, { style: { ...theme({ textColor: 'red-500' }), ...input.style } })
    }
  }
}

const ViewMenuItem = (input: { model: BackendConnectionStatus; ctx: { t: Translator }; onPress: () => void }) => {
  const { model, ctx } = input
  switch (model.t) {
    case 'connected': {
      return h(MenuItem, {
        renderIcon: (iconProps) => h(Dot, iconProps),
        color: 'success',
        primary: ctx.t('wire.online'),
        renderEnd: (endProps) => h(Typography, { text: TimeSpan.format(model.latestPing), ...endProps }),
        onPress: input.onPress,
      })
    }

    case 'connecting': {
      return h(MenuItem, {
        renderIcon: (iconProps) => h(Dot, iconProps),
        color: 'warning',
        primary: ctx.t('wire.connecting...'),
        onPress: input.onPress,
      })
    }

    case 'disconnected': {
      return h(MenuItem, {
        renderIcon: (iconProps) => h(Dot, iconProps),
        color: 'danger',
        primary: ctx.t('wire.offline'),
        onPress: input.onPress,
      })
    }
  }
}

const Dot = (input: { style: Record<string, unknown> }) => {
  return h(Svg, { viewBox: '0 0 16 16', style: input.style, fill: 'currentColor' }, [
    h(Circle, { cx: '8', cy: '8', r: '6', fill: 'currentColor' }),
  ])
}

export const BackendConnectionStatus = {
  ViewDot,
  ViewMenuItem,
}

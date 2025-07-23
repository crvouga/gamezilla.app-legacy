import { Translator } from '~/@/l18n/generated'
import { Box } from '~/@/vdom/primitives/box'
import { TimeSpan } from '~/@/time/time-span'
import { cn } from '~/@/ui/cn'
import { ListItem } from '~/@/ui/list-item'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'

export type BackendConnectionStatus =
  | { t: 'connected'; averagePing: TimeSpan; latestPing: TimeSpan }
  | { t: 'disconnected' }
  | { t: 'connecting' }

const ViewDot = (input: { model: BackendConnectionStatus; ctx: { t: Translator }; class: string }) => {
  switch (input.model.t) {
    case 'connected': {
      return Dot({ class: input.class, colorClassName: 'bg-green-500' })
    }

    case 'connecting': {
      return Dot({ class: input.class, colorClassName: 'animate-pulse bg-orange-500' })
    }

    case 'disconnected': {
      return Dot({ class: input.class, colorClassName: 'bg-red-500' })
    }
  }
}

const ViewListItem = (input: { model: BackendConnectionStatus; ctx: { t: Translator }; onPressDown: () => void }) => {
  const { model, ctx } = input
  switch (model.t) {
    case 'connected': {
      return h(ListItem, {
        icon: (inputIcon) => h(Dot, { class: inputIcon.class, colorClassName: 'bg-green-500' }),
        class: 'text-green-500',
        primary: ctx.t('wire.online'),
        end: () => h(Typography, { text: TimeSpan.format(model.latestPing) }),
        onPressDown: input.onPressDown,
      })
    }

    case 'connecting': {
      return h(ListItem, {
        icon: (input) => h(Dot, { class: input.class, colorClassName: 'bg-orange-500' }),
        color: 'warning',
        primary: ctx.t('wire.connecting...'),
        onPressDown: input.onPressDown,
      })
    }

    case 'disconnected': {
      return h(ListItem, {
        icon: (input) => h(Dot, { class: input.class, colorClassName: 'bg-red-500' }),
        color: 'danger',
        primary: ctx.t('wire.offline'),
        onPressDown: input.onPressDown,
      })
    }
  }
}

const Dot = (input: { class: string; colorClassName: string }) => {
  return h(Box, { class: cn(input.class, 'aspect-square shrink-0 p-[1px]') }, [
    h(Box, { class: cn(input.colorClassName, 'h-full w-full shrink-0 rounded-full') }),
  ])
}

export const BackendConnectionStatus = {
  ViewDot,
  ViewListItem,
}

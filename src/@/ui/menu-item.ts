import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { Box } from '../vdom/primitives/box'
import { ClickableTransparent } from './clickable'
import { cn } from './cn'
import { preventConsoleErrorWhenClosingDrawer } from './surface-drawer/drawer-shared'
import { Typography } from './typography'

type Input = {
  class?: string
  icon?: (input: { class: string; width: number; height: number; fill: string; stroke: string }) => VDom
  end?: () => VDom
  primary: TranslatedText
  secondary?: TranslatedText
  onPress?: () => void
  color?: Color
  link?: boolean
  selected?: boolean
}

export const MenuItem = (input: Input) => {
  return h(
    ClickableTransparent,
    {
      role: 'menuitem',
      'aria-label': input.primary,
      class: cn(input.class, BASE_CLASS, toColorClass(input)),
      'aria-selected': input.selected,
      onPress: input.onPress,
    },
    [
      h(MenuItemContent, {
        primary: input.primary,
        icon: input.icon,
        secondary: input.secondary,
        onPress: (event) => {
          preventConsoleErrorWhenClosingDrawer(event)
          input.onPress?.()
        },
      }),
      input.end && h(Box, { class: 'shrink-0 flex flex-row items-center gap-2' }, [input.end()]),
    ],
  )
}

const MenuItemContent = (input: {
  primary: TranslatedText
  icon?: (input: { class: string; width: number; height: number; fill: string; stroke: string }) => VDom
  end?: () => VDom
  secondary?: TranslatedText
  onPress?: (event: unknown) => void
}) => {
  return h(Box, { class: 'h-full flex flex-row flex-1 items-center gap-3 truncate' }, [
    input.icon?.({ class: 'size-8', width: 24, height: 24, fill: '#fff', stroke: '#fff' }),
    h(Box, { class: 'flex flex-col gap-1 text-left' }, [
      h(Typography, {
        variant: 'body',
        class: 'text-white',
        sizeClassName: 'text-lg',
        text: input.primary,
      }),
      input.secondary &&
        h(Typography, {
          class: 'text-left',
          sizeClassName: 'text-xs',
          color: 'text-secondary',
          text: input.secondary,
        }),
    ]),
  ])
}

const BASE_CLASS = 'flex flex-row w-full shrink-0 items-center truncate h-16 px-4 text-xl font-bold'

type Color = 'default' | 'danger' | 'warning' | 'success' | 'inherit' | 'selected'

const toColorClass = (input: Input) => {
  switch (input.color ?? 'default') {
    case 'warning': {
      return 'text-orange-500'
    }
    case 'danger': {
      return 'text-red-500'
    }
    default: {
      return ''
    }
  }
}

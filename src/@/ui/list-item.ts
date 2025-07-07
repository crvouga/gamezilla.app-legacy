import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { ClickableTransparent } from './clickable'
import { cn } from './cn'
import { preventConsoleErrorWhenClosingDrawer } from './surface-drawer/drawer-shared'
import { Typography } from './typography'

type Input = {
  class?: string
  icon?: (input: { class: string }) => VDom
  end?: () => VDom
  primary: TranslatedText
  secondary?: TranslatedText
  onClick?: () => void
  color?: Color
  dataTestId?: string
  link?: boolean
  selected?: boolean
}

export const ListItem = (input: Input) => {
  const element = input.onClick ? 'button' : 'div'
  switch (element) {
    case 'button': {
      return h(
        ClickableTransparent,
        {
          role: 'button',
          onClick: (event) => {
            preventConsoleErrorWhenClosingDrawer(event)
            input.onClick?.()
          },
          'aria-label': input.primary,
          dataTestId: input.dataTestId,
          name: input.primary,
          class: cn(input.class, BASE_CLASS, toColorClass(input)),
          'aria-selected': input.selected ? 'true' : 'false',
        },
        [
          h(ListItemContent, {
            primary: input.primary,
            icon: input.icon,
            secondary: input.secondary,
          }),
          input.end && h('div', { class: 'shrink-0 flex items-center gap-2' }, [input.end()]),
        ],
      )
    }
    default: {
      return h(
        'div',
        {
          onClick: (event: unknown) => {
            preventConsoleErrorWhenClosingDrawer(event)
            input.onClick?.()
          },
          'aria-label': input.primary,
          'data-testid': input.dataTestId,
          class: cn(input.class, BASE_CLASS, toColorClass(input)),
          'aria-selected': input.selected ? 'true' : 'false',
        },
        [
          h(ListItemContent, {
            primary: input.primary,
            icon: input.icon,
            secondary: input.secondary,
          }),
          input.end && h('div', { class: 'shrink-0' }, [input.end()]),
        ],
      )
    }
  }
}

const ListItemContent = (input: {
  primary: TranslatedText
  icon?: (input: { class: string }) => VDom
  end?: () => VDom
  secondary?: TranslatedText
}) => {
  return h('div', { class: 'flex flex-1 items-center gap-3 truncate' }, [
    input.icon?.({ class: 'size-8' }),
    h('div', { class: 'flex flex-col gap-1 text-left' }, [
      h(Typography, {
        variant: 'body',
        class: 'font-bold text-xl',
        text: input.primary,
      }),
      input.secondary && h(Typography, { class: 'text-left text-xs', color: 'text-secondary', text: input.secondary }),
    ]),
  ])
}

const BASE_CLASS = 'flex w-full shrink-0 items-center truncate h-16 px-4 text-xl font-bold'

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

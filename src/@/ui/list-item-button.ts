import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import { ClickableTransparent } from './clickable'
import { cn } from './cn'
import { preventConsoleErrorWhenClosingDrawer } from './surface-drawer/drawer-shared'

type Input = {
  class?: string
  icon: (input: { class: string }) => VDom
  end?: () => VDom
  label: TranslatedText
  onClick?: () => void
  color?: Color
  dataTestId?: string
  key?: string
}

export const ListItemButton = (input: Input) => {
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
          'aria-label': input.label,
          dataTestId: input.dataTestId,
          name: input.label,
          class: cn(input.class, BASE_CLASS, toColorClass(input)),
        },
        [
          h('div', { class: 'flex flex-1 items-center gap-3 truncate' }, [
            input.icon({ class: 'size-6' }),
            input.label,
          ]),
          input.end && h('div', { class: 'shrink-0' }, [input.end()]),
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
          'aria-label': input.label,
          'data-testid': input.dataTestId,
          class: cn(input.class, BASE_CLASS, toColorClass(input)),
        },
        [
          h('div', { class: 'flex flex-1 items-center gap-3 truncate' }, [
            input.icon({ class: 'size-6' }),
            input.label,
          ]),
          input.end && h('div', { class: 'shrink-0' }, [input.end()]),
        ],
      )
    }
  }
}

const BASE_CLASS = 'flex w-full shrink-0 items-center truncate p-4 text-lg font-bold'

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

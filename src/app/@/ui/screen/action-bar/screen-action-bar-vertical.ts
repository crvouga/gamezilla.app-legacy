import { ClickableTransparent } from '~/@/ui/clickable'
import { cn } from '~/@/ui/cn'
import { Frag } from '~/@/ui/frag'
import { Spinner } from '~/@/ui/spinner'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { ScreenNavBarTabletRoot } from '../nav-bar/screen-nav-bar-tablet'
import { ScreenAction, ScreenActionBarProps } from './screen-action-bar-props'

const SIZE = 'md' as 'md' | 'sm'

export const VerticalActionBar = (
  input: ScreenActionBarProps & {
    class?: string
    renderNavBar?: () => VDom
  },
) => {
  return h('div', { class: cn('flex h-full max-w-48 flex-1 shrink-0 flex-col gap-1', input.class) }, [
    h(ScreenNavBarTabletRoot, {}, [input.renderNavBar?.()]),

    input.variant.t === 'uniform'
      ? h(VerticalUniform, { actions: input.variant.actions })
      : h(VerticalSpaceBetween, { start: input.variant.start, end: input.variant.end }),
  ])
}

const VerticalUniform = (input: { actions: (ScreenAction | null)[] }) => {
  return h(Toolbar, {}, [h(ActionButtonList, { actions: input.actions })])
}

const VerticalSpaceBetween = (input: { start: (ScreenAction | null)[]; end: (ScreenAction | null)[] }) => {
  return h(Toolbar, {}, [
    h(ActionButtonList, { actions: input.start }),
    h('div', { class: 'flex-1' }),
    h(ActionButtonList, { actions: input.end }),
    h('div', { class: 'w-full pb-6' }),
  ])
}

const Toolbar = (input: { children: VDom }) => {
  return h('div', { class: 'flex w-full flex-1 shrink-0 flex-col', role: 'toolbar' }, [input.children])
}

const ActionButtonList = (input: { actions: (ScreenAction | null)[] }) => {
  return h(
    'div',
    { class: 'flex w-full shrink-0 flex-col gap-2' },
    input.actions.map((action) => {
      if (!action) return null

      const button = h(ScreenActionButton, { ...action, size: SIZE })

      if (!action.renderSurface) return h(Frag, { key: action.id }, [button])

      return h(Frag, { key: action.id }, [
        action.renderSurface({
          dropDown: { reference: button },
          screenActionLocation: 'bar',
        }),
      ])
    }),
  )
}

const ScreenActionButton = (input: ScreenAction) => {
  const isDisabled = input.disabled || input.loading
  const size = input.size ?? 'md'
  if (input.hidden) return null
  return h(
    ClickableTransparent,
    {
      'data-testid': input.testId,
      role: 'button',
      disabled: isDisabled,
      name: input.label,
      'aria-disabled': isDisabled,
      'aria-label': input.label,
      'aria-hidden': input.hidden,
      onClick: input.onClick,
      class: cn(
        'relative flex w-full min-w-32 flex-col items-center rounded-lg p-4 xl:flex-row',
        toColorClasses(input),
        input.hidden ? 'hidden' : '',
        input.classNames?.button,
        toSizeClasses(size),
      ),
    },
    [
      h(
        'div',
        {
          class: cn(
            'flex flex-col items-center gap-1 xl:flex-row xl:gap-4',
            input.loading ? 'opacity-0' : 'opacity-100',
          ),
        },
        [
          input.icon({ class: toIconSizeClasses(size) }),
          h(Typography, {
            text: input.label,
            class: cn('truncate text-center xl:text-left xl:text-xl', 'text-inherit', input.classNames?.label),
          }),
        ],
      ),

      input.loading &&
        h('div', { class: 'absolute inset-0 flex h-full w-full items-center justify-center' }, [
          h(Spinner, { class: toIconSizeClasses(size) }),
        ]),
    ],
  )
}

const toColorClasses = (input: ScreenAction): string => {
  switch (input.color) {
    case 'danger':
      return 'text-red-500'
    case 'success':
      return 'text-green-500'
    case 'selected':
      return 'text-blue-500 font-bold'
    default:
      return ''
  }
}

const toSizeClasses = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'text-lg'
    case 'md':
    default:
      return 'text-lg'
  }
}

const toIconSizeClasses = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'size-8'
    case 'md':
    default:
      return 'size-8'
  }
}

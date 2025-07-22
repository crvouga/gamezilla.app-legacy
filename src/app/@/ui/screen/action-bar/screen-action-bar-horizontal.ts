import { ClickableTransparent } from '~/@/ui/clickable'
import { Box } from '~/@/vdom/box'
import { cn } from '~/@/ui/cn'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { Frag } from '~/@/ui/frag'
import { IconEllipsisVertical } from '~/@/ui/icon'
import { ListItem } from '~/@/ui/list-item'
import { Spinner } from '~/@/ui/spinner'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { SurfaceLayout } from '../../surface/layout/surface-layout'
import {
  ScreenAction,
  ScreenActionBarProps,
  ScreenActionsSpaceBetween,
  ScreenActionsUniform,
} from './screen-action-bar-props'

const DEFAULT_LIMIT = Infinity

export const HorizontalActionBar = (input: ScreenActionBarProps) => {
  switch (input.variant.t) {
    case 'uniform':
      return HorizontalUniform({ ...input, ...input.variant })
    case 'space-between':
      return HorizontalSpaceBetween({ ...input, ...input.variant })
  }
}

const toDropDownConfig = (reference: { render: () => VDom }): DropDownConfig => {
  return {
    reference: {
      render: reference.render,
    },
    alignment: 'starting',
    position: 'bottom',
  }
}

const HorizontalUniform = (input: ScreenActionBarProps & ScreenActionsUniform) => {
  const size = input.size ?? 'md'
  const limit = input.limit?.max ?? DEFAULT_LIMIT
  const firstActions = input.actions.slice(0, limit)
  const lastActions = input.actions.slice(limit)
  const hasLastActions = lastActions.some((button) => button !== null)
  return h(Box, { class: cn('flex w-full shrink-0 items-center', toHeightClass(size)), role: 'toolbar' }, [
    ...firstActions.map((action) => {
      if (!action) return null

      const button = ScreenActionButton({ ...action, size: input.size })

      if (!action.renderSurface) return h(Frag, { key: action.id }, [button])

      return h(Frag, { key: action.id }, [
        action.renderSurface({
          dropDown: toDropDownConfig({ render: () => button }),
          screenActionLocation: 'bar',
        }),
      ])
    }),

    hasLastActions &&
      h(SurfaceLayout, {
        ctx: input.ctx,
        id: input.id,
        ariaLabel: input.ctx.t('app.more'),
        onClose: input.limit?.onToggle ?? (() => {}),
        open: input.limit?.open ?? false,
        body: {
          render: () => SurfaceMoreContent({ actions: lastActions }),
        },
        dropDown: {
          reference: {
            render: () =>
              ScreenActionButton({
                id: input.ctx.t('app.more'),
                icon: (input) => h(IconEllipsisVertical, input),
                label: input.ctx.t('app.more'),
                size: input.size,
                onClick: input.limit?.onToggle ?? (() => {}),
              }),
          },
        },
      }),
  ])
}

const SurfaceMoreContent = (input: { actions: (ScreenAction | null)[] }) => {
  return h(
    Frag,
    {},
    input.actions.map((action) => {
      if (!action) return null
      if (action.hidden) return null
      const listItemButton = h(ListItem, {
        key: action.id,
        icon: action.icon,
        primary: action.label,
        onClick: action.onClick,
        color: action.color,
      })
      if (!action.renderSurface) return listItemButton
      return h(Frag, { key: action.id }, [
        action.renderSurface({
          dropDown: toDropDownConfig({ render: () => listItemButton }),
          screenActionLocation: 'more-drawer',
        }),
      ])
    }),
  )
}

const HorizontalSpaceBetween = (input: ScreenActionBarProps & ScreenActionsSpaceBetween) => {
  const size = input.size ?? 'md'
  return h(
    Box,
    { class: cn('flex w-full shrink-0 items-center justify-between', toHeightClass(size)), role: 'toolbar' },
    [
      h(
        Box,
        { class: 'flex items-center' },
        input.start.map((action) => {
          if (!action) return null

          const button = ScreenActionButton({ ...action, size: input.size, class: 'min-w-20' })

          if (!action.renderSurface) return h(Frag, { key: action.id }, [button])

          return h(Frag, { key: action.id }, [
            action.renderSurface({
              dropDown: toDropDownConfig({ render: () => button }),
              screenActionLocation: 'bar',
            }),
          ])
        }),
      ),

      h(
        Box,
        { class: 'flex items-center' },
        input.end.map((action) => {
          if (!action) return null

          const button = ScreenActionButton({ ...action, size: input.size, class: 'min-w-20' })

          if (!action.renderSurface) return h(Frag, { key: action.id }, [button])

          return h(Frag, { key: action.id }, [
            action.renderSurface({
              dropDown: toDropDownConfig({ render: () => button }),
              screenActionLocation: 'bar',
            }),
          ])
        }),
      ),
    ],
  )
}

const ScreenActionButton = (input: ScreenAction & { class?: string }) => {
  const isDisabled = input.disabled || input.loading
  const size = input.size ?? 'md'
  if (input.hidden) return null
  return h(
    ClickableTransparent,
    {
      role: 'button',
      disabled: isDisabled,
      name: input.label,
      'aria-disabled': isDisabled,
      'aria-label': input.label,
      'aria-hidden': input.hidden,
      onClick: input.onClick,
      class: cn(
        'relative flex flex-1 flex-col items-center gap-0.5 truncate p-2 font-normal',
        'disabled:cursor-not-allowed disabled:opacity-50',
        toColorClasses(input),
        input.hidden ? 'hidden' : '',
        input.classNames?.button,
        toSizeClasses(size),
        input.class,
      ),
    },
    [
      h(
        Box,
        {
          class: cn(
            'flex h-full w-full flex-col items-center justify-center gap-0.5 truncate',
            input.loading ? 'opacity-0' : 'opacity-100',
          ),
        },
        [
          input.icon({ class: toIconSizeClasses(size) }),
          h(Typography, {
            variant: 'label',
            text: input.label,
            class: cn('truncate', input.classNames?.label),
          }),
        ],
      ),

      input.loading &&
        h(Box, { class: 'absolute inset-0 flex h-full w-full items-center justify-center' }, [
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
      return 'text-blue-500'
    default:
      return ''
  }
}

const toSizeClasses = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'p-1.5 text-xs'
    case 'md':
    default:
      return 'p-2 text-sm'
  }
}

const toIconSizeClasses = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'size-5'
    case 'md':
    default:
      return 'size-8'
  }
}

const toHeightClass = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'h-12'
    case 'md':
    default:
      return 'h-16'
  }
}

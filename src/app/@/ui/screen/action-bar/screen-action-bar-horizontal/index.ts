import { cn } from '~/@/ui/cn'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { IconEllipsisVertical } from '~/@/ui/icon'
import { ListItem } from '~/@/ui/list-item'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Frag } from '~/@/vdom/primitives/frag'
import { VDom } from '~/@/vdom/vdom'
import { SurfaceLayout } from '../../../surface/layout/surface-layout'
import {
  ScreenAction,
  ScreenActionBarProps,
  ScreenActionsSpaceBetween,
  ScreenActionsUniform,
} from '../screen-action-bar-props'
import { ScreenActionButton } from './screen-action-button'

const DEFAULT_LIMIT = Infinity

export const HorizontalActionBar = (input: ScreenActionBarProps) => {
  switch (input.variant.t) {
    case 'uniform':
      return h(HorizontalUniform, { ...input, ...input.variant })
    case 'space-between':
      return h(HorizontalSpaceBetween, { ...input, ...input.variant })
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
  return h(
    Box,
    { class: cn('flex flex-row w-full shrink-0 items-center justify-center', toHeightClass(size)), role: 'toolbar' },
    [
      ...firstActions.map((action) => {
        if (!action) return null

        const button = h(ScreenActionButton, { ...action, size: input.size })

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
            render: () => h(SurfaceMoreContent, { actions: lastActions }),
          },
          dropDown: {
            reference: {
              render: () =>
                h(ScreenActionButton, {
                  id: input.ctx.t('app.more'),
                  icon: (input) => h(IconEllipsisVertical, input),
                  label: input.ctx.t('app.more'),
                  size: input.size,
                  onPress: input.limit?.onToggle ?? (() => {}),
                }),
            },
          },
        }),
    ],
  )
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
        onPress: action.onPress,
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
    { class: cn('flex flex-row w-full shrink-0 items-center justify-between', toHeightClass(size)), role: 'toolbar' },
    [
      h(
        Box,
        { class: 'flex flex-row items-center w-full' },
        input.start.map((action) => {
          if (!action) return null

          const button = h(ScreenActionButton, { ...action, size: input.size, class: 'min-w-20' })

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
        { class: 'flex flex-row items-center' },
        input.end.map((action) => {
          if (!action) return null

          const button = h(ScreenActionButton, { ...action, size: input.size, class: 'min-w-20' })

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

const toHeightClass = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'h-12'
    case 'md':
    default:
      return 'h-16'
  }
}

import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { IconEllipsisVertical } from '~/@/ui/icon'
import { MenuItem } from '~/@/ui/menu-item'
import { sx } from '~/@/vdom/style/sx'
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

const BASE_STYLE = sx({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'full',
  paddingX: 6,
})

const HorizontalUniform = (input: ScreenActionBarProps & ScreenActionsUniform) => {
  const size = input.size ?? 'md'
  const limit = input.limit?.max ?? DEFAULT_LIMIT
  const firstActions = input.actions.slice(0, limit)
  const lastActions = input.actions.slice(limit)
  const hasLastActions = lastActions.some((button) => button !== null)
  return h(Box, { role: 'toolbar', style: { ...BASE_STYLE, ...toHeightStyle(size) } }, [
    ...firstActions.map((action) => {
      if (!action) return null

      const button = h(ScreenActionButton, {
        ...action,
        size: input.size,
        style: sx({ flex: 1 }),
      })

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
                renderIcon: (iconProps) => h(IconEllipsisVertical, iconProps),
                label: input.ctx.t('app.more'),
                size: input.size,
                onPress: input.limit?.onToggle ?? (() => {}),
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
      const listItemButton = h(MenuItem, {
        key: action.id,
        renderIcon: action.renderIcon,
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
  return h(Box, { role: 'toolbar', style: { ...BASE_STYLE, ...toHeightStyle(size) } }, [
    h(
      Box,
      {
        style: sx({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          flex: 1,
        }),
      },
      input.start.map((action) => {
        if (!action) return null

        const button = h(ScreenActionButton, {
          ...action,
          size: input.size,
          style: sx({
            width: 20,
            justifyContent: 'flex-start',
          }),
        })

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
      {
        style: sx({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flex: 1,
        }),
      },
      input.end.map((action) => {
        if (!action) return null

        const button = h(ScreenActionButton, {
          ...action,
          size: input.size,
          style: sx({
            width: 20,
            justifyContent: 'flex-end',
          }),
        })

        if (!action.renderSurface) return h(Frag, { key: action.id }, [button])

        return h(Frag, { key: action.id }, [
          action.renderSurface({
            dropDown: toDropDownConfig({ render: () => button }),
            screenActionLocation: 'bar',
          }),
        ])
      }),
    ),
  ])
}

const toHeightStyle = (size: ScreenAction['size']): Record<string, unknown> => {
  switch (size) {
    case 'sm':
      return sx({ height: 12 })
    case 'md':
      return sx({ height: 16 })
    default:
      return sx({ height: 16 })
  }
}

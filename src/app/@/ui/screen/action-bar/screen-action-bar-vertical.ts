import { ClickableTransparent } from '~/@/ui/clickable'
import { Spinner } from '~/@/ui/spinner'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Frag } from '~/@/vdom/primitives/frag'
import { VDom } from '~/@/vdom/vdom'
import { ScreenNavBarTabletRoot } from '../layout/screen-layout-tablet/screen-nav-bar-tablet'
import { ScreenAction, ScreenActionBarProps } from './screen-action-bar-props'

const SIZE = 'md' as 'md' | 'sm'

export const VerticalActionBar = (
  input: ScreenActionBarProps & {
    style?: Record<string, unknown>
    renderNavBar?: () => VDom
  },
) => {
  return h(
    Box,
    {
      style: {
        ...theme({
          height: 'full',
          maxWidth: 'md',
          flex: 1,
          flexShrink: 0,
          flexDirection: 'col',
          gap: 1,
        }),
        ...input.style,
      },
    },
    [
      h(ScreenNavBarTabletRoot, {}, [input.renderNavBar?.()]),

      input.variant.t === 'uniform'
        ? h(VerticalUniform, { actions: input.variant.actions })
        : h(VerticalSpaceBetween, { start: input.variant.start, end: input.variant.end }),
    ],
  )
}

const VerticalUniform = (input: { actions: (ScreenAction | null)[] }) => {
  return h(Toolbar, {}, [h(ActionButtonList, { actions: input.actions })])
}

const VerticalSpaceBetween = (input: { start: (ScreenAction | null)[]; end: (ScreenAction | null)[] }) => {
  return h(Toolbar, {}, [
    h(ActionButtonList, { actions: input.start }),
    h(Box, { style: theme({ flex: 1 }) }),
    h(ActionButtonList, { actions: input.end }),
    h(Box, { style: theme({ width: 'full', paddingBottom: 6 }) }),
  ])
}

const Toolbar = (input: { children: VDom }) => {
  return h(
    Box,
    {
      style: theme({
        width: 'full',
        flex: 1,
        flexShrink: 0,
        flexDirection: 'col',
      }),
      role: 'toolbar',
    },
    [input.children],
  )
}

const ActionButtonList = (input: { actions: (ScreenAction | null)[] }) => {
  return h(
    Box,
    {
      style: theme({
        width: 'full',
        flexShrink: 0,
        flexDirection: 'col',
        gap: 2,
      }),
    },
    input.actions.map((action) => {
      if (!action) return null

      const button = h(ScreenActionButton, { ...action, size: SIZE })

      if (!action.renderSurface) return h(Frag, { key: action.id }, [button])

      return h(Frag, { key: action.id }, [
        action.renderSurface({
          dropDown: { reference: { render: () => button } },
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
      'aria-disabled': isDisabled,
      'aria-label': input.label,
      'aria-hidden': input.hidden,
      onPress: input.onPress,
      style: {
        ...theme({
          position: 'relative',
          width: 'full',
          flexDirection: 'col',
          alignItems: 'center',
          rounded: 'lg',
          padding: 4,
        }),
        ...toColorStyle(input),
        ...input.styles?.button,
        ...toSizeStyle(size),
        display: input.hidden ? 'none' : 'flex',
      },
    },
    [
      h(
        Box,
        {
          style: {
            ...theme({
              flexDirection: 'col',
              alignItems: 'center',
              gap: 1,
            }),
            opacity: input.loading ? 0 : 1,
          },
        },
        [
          input.renderIcon({ style: { ...toIconSizeStyle(size), ...theme({ textColor: 'white' }) } }),
          h(Typography, {
            text: input.label,
            ...input.styles?.label,
            style: {
              ...theme({
                overflow: 'hidden',
                textAlign: 'center',
                textColor: 'white',
              }),
            },
          }),
        ],
      ),

      input.loading &&
        h(
          Box,
          {
            style: theme({
              position: 'absolute',
              inset: 0,
              flexDirection: 'row',
              width: 'full',
              height: 'full',
              alignItems: 'center',
              justifyContent: 'center',
            }),
          },
          [h(Spinner, { style: toIconSizeStyle(size) })],
        ),
    ],
  )
}

const toColorStyle = (input: ScreenAction): Record<string, unknown> => {
  switch (input.color) {
    case 'danger':
      return theme({ textColor: 'red-500' })
    case 'success':
      return theme({ textColor: 'green-500' })
    case 'selected':
      return { ...theme({ textColor: 'blue-500' }), fontWeight: 'bold' }
    default:
      return {}
  }
}

const toSizeStyle = (size: ScreenAction['size']): Record<string, unknown> => {
  switch (size) {
    case 'sm':
      return theme({ fontSize: 'lg' })
    case 'md':
    default:
      return theme({ fontSize: 'lg' })
  }
}

const toIconSizeStyle = (size: ScreenAction['size']): Record<string, unknown> => {
  switch (size) {
    case 'sm':
      return theme({ size: 8 })
    case 'md':
    default:
      return theme({ size: 8 })
  }
}

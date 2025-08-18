import { ClickableTransparent } from '~/@/ui/clickable'
import { Spinner } from '~/@/ui/spinner'
import { sx } from '~/@/vdom/style/sx'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Frag } from '~/@/vdom/primitives/frag'
import { VDom } from '~/@/vdom/vdom'
import { ScreenNavBarTabletRoot } from '../layout/screen-layout-tablet/screen-nav-bar-tablet'
import { ScreenAction as ScreenActionProps, ScreenActionBarProps } from './screen-action-bar-props'
import { ScreenLayoutProps } from '../layout/screen-layout-props'

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
        ...sx({
          height: 'full',
          maxWidth: '3xs',
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
        ? h(VerticalUniform, { actions: input.variant.actions, ctx: input.ctx })
        : h(VerticalSpaceBetween, { start: input.variant.start, end: input.variant.end, ctx: input.ctx }),
    ],
  )
}

const VerticalUniform = (props: { actions: (ScreenActionProps | null)[]; ctx: ScreenLayoutProps['ctx'] }) => {
  return h(Toolbar, {}, [h(ActionButtonList, props)])
}

const VerticalSpaceBetween = (input: {
  start: (ScreenActionProps | null)[]
  end: (ScreenActionProps | null)[]
  ctx: ScreenLayoutProps['ctx']
}) => {
  return h(Toolbar, {}, [
    h(ActionButtonList, { actions: input.start, ctx: input.ctx }),
    h(Box, { style: sx({ flex: 1 }) }),
    h(ActionButtonList, { actions: input.end, ctx: input.ctx }),
    h(Box, { style: sx({ width: 'full', paddingBottom: 6 }) }),
  ])
}

const Toolbar = (input: { children: VDom }) => {
  return h(
    Box,
    {
      style: sx({
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

const ActionButtonList = (props: { actions: (ScreenActionProps | null)[]; ctx: ScreenLayoutProps['ctx'] }) => {
  return h(
    Box,
    {
      style: sx({
        width: 'full',
        flexShrink: 0,
        flexDirection: 'col',
        gap: 2,
      }),
    },
    props.actions.map((action) => {
      if (!action) return null

      const button = h(ScreenActionButton, { ...action, size: SIZE, ctx: props.ctx })

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

const ScreenActionButton = (props: ScreenActionProps & { ctx: ScreenLayoutProps['ctx'] }) => {
  const isDisabled = props.disabled || props.loading
  const size = props.size ?? 'md'
  const styleColor = toColorStyle(props)
  if (props.hidden) return null
  return h(
    ClickableTransparent,
    {
      'data-testid': props.testId,
      role: 'button',
      disabled: isDisabled,
      'aria-disabled': isDisabled,
      'aria-label': props.label,
      'aria-hidden': props.hidden,
      onPress: props.onPress,
      style: {
        ...sx({
          position: 'relative',
          width: 'full',
          flexDirection: 'col',
          alignItems: 'center',
          rounded: 'lg',
          padding: 4,
          display: props.hidden ? 'none' : 'flex',
        }),
        ...props.styles?.button,

        ...toSizeStyle(size),
      },
    },
    [
      h(
        Box,
        {
          style:
            props.ctx.screenSize === 'desktop'
              ? sx({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  width: 'full',
                  gap: 3,
                  opacity: props.loading ? 0 : 1,
                })
              : sx({
                  flexDirection: 'col',
                  alignItems: 'center',
                  gap: 2,
                  opacity: props.loading ? 0 : 1,
                }),
        },
        [
          props.renderIcon({
            style: {
              ...toIconSizeStyle(size),
              ...sx({ flexShrink: 0 }),
              ...styleColor,
            },
          }),
          h(Typography, {
            text: props.label,
            style: {
              ...sx({
                overflow: 'hidden',
                textAlign: 'center',
              }),
              ...styleColor,
              ...props.styles?.label,
            },
          }),
        ],
      ),

      props.loading &&
        h(
          Box,
          {
            style: sx({
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

const toColorStyle = (input: ScreenActionProps): Record<string, unknown> => {
  switch (input.color) {
    case 'danger':
      return sx({ textColor: 'red-500' })
    case 'success':
      return sx({ textColor: 'green-500' })
    case 'selected':
      return sx({ textColor: 'blue-500', fontWeight: 'bold' })
    case 'inherit':
      return sx({ textColor: 'white' })
    default:
      return sx({ textColor: 'white' })
  }
}

const toSizeStyle = (size: ScreenActionProps['size']): Record<string, unknown> => {
  switch (size) {
    case 'sm':
      return sx({ fontSize: 'lg' })
    case 'md':
    default:
      return sx({ fontSize: 'lg' })
  }
}

const toIconSizeStyle = (size: ScreenActionProps['size']): Record<string, unknown> => {
  switch (size) {
    case 'sm':
      return sx({ size: 8 })
    case 'md':
    default:
      return sx({ size: 8 })
  }
}

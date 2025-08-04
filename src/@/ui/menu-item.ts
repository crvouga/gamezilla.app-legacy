import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { Box } from '../vdom/primitives/box'
import { Clickable } from './clickable'
import { theme } from './theme/theme'
import { Typography } from './typography'

export type MenuItemProps = {
  renderIcon?: (input: { style: Record<string, unknown> }) => VDom
  renderEnd?: (input: { style: Record<string, unknown> }) => VDom
  primary: TranslatedText
  secondary?: TranslatedText
  onPress?: () => void
  color?: Color
  link?: boolean
  selected?: boolean
}

export const MenuItem = (props: MenuItemProps) => {
  const colorStyle = toColorStyle(props)

  return h(
    Clickable,
    {
      role: 'menuitem',
      'aria-label': props.primary,
      style: {
        ...colorStyle,
        ...theme({
          flexDirection: 'row',
          width: 'full',
          alignItems: 'center',
          overflow: 'hidden',
          height: 16,
          paddingX: 4,
          fontSize: 'xl',
          fontWeight: 'bold',
        }),
      },
      'aria-selected': props.selected,
      onPress: props.onPress,
    },
    [
      h(MenuItemContent, props),
      props.renderEnd?.({
        style: {
          ...colorStyle,
          ...theme({
            fontSize: 'lg',
          }),
        },
      }),
    ],
  )
}

const MenuItemContent = (props: MenuItemProps) => {
  const colorStyle = toColorStyle(props)

  return h(
    Box,
    {
      style: theme({
        height: 'full',
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        gap: 3,
        overflow: 'hidden',
      }),
    },
    [
      props.renderIcon?.({
        style: {
          ...colorStyle,
          ...theme({ size: 8 }),
        },
      }),
      h(Box, { style: theme({ flexDirection: 'col', gap: 1 }) }, [
        h(Typography, {
          variant: 'body',
          style: {
            ...colorStyle,
            ...theme({ fontSize: 'lg' }),
          },
          text: props.primary,
        }),
        props.secondary &&
          h(Typography, {
            style: {
              ...colorStyle,
              ...theme({
                textAlign: 'left',
                fontSize: 'xs',
                textColor: 'neutral-300',
              }),
            },
            text: props.secondary,
          }),
      ]),
    ],
  )
}

type Color = 'default' | 'danger' | 'warning' | 'success' | 'inherit' | 'selected' | 'green' | 'orange'

const toColorStyle = (input: { color?: Color }): Record<string, unknown> => {
  switch (input.color ?? 'default') {
    case 'warning':
      return theme({ textColor: 'orange-500' })
    case 'danger':
      return theme({ textColor: 'red-500' })
    case 'green':
      return theme({ textColor: 'green-500' })
    case 'orange':
      return theme({ textColor: 'orange-500' })
    case 'success':
      return theme({ textColor: 'green-500' })
    case 'selected':
      return theme({ textColor: 'blue-500' })
    case 'inherit':
      return theme({ textColor: 'white' })
    case 'default':
      return theme({ textColor: 'white' })
    default:
      return theme({ textColor: 'white' })
  }
}

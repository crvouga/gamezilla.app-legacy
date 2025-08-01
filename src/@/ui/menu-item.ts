import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { Box } from '../vdom/primitives/box'
import { ClickableTransparent } from './clickable'
import { theme } from './theme/theme'
import { Typography } from './typography'

export type MenuItemProps = {
  renderIcon?: (input: { class: string; width: number; height: number; fill: string; stroke: string }) => VDom
  renderEnd?: (input: { style: Record<string, unknown> }) => VDom
  primary: TranslatedText
  secondary?: TranslatedText
  onPress?: () => void
  color?: Color
  link?: boolean
  selected?: boolean
}

export const MenuItem = (props: MenuItemProps) => {
  const baseStyle = theme({
    flexDirection: 'row',
    width: 'full',
    items: 'center',
    overflow: 'hidden',
    height: 16,
    px: 4,
    textSize: 'xl',
    fontWeight: 'bold',
  })

  const colorStyle = toColorStyle(props)

  return h(
    ClickableTransparent,
    {
      role: 'menuitem',
      'aria-label': props.primary,
      style: {
        ...baseStyle,
        ...colorStyle,
      },
      'aria-selected': props.selected,
      onPress: props.onPress,
    },
    [
      h(MenuItemContent, {
        primary: props.primary,
        renderIcon: props.renderIcon,
        secondary: props.secondary,
      }),
      props.renderEnd &&
        h(
          Box,
          {
            style: theme({
              flexDirection: 'row',
              items: 'center',
              gap: 2,
            }),
          },
          [
            props.renderEnd({
              style: theme({
                textColor: 'white',
                textSize: 'lg',
              }),
            }),
          ],
        ),
    ],
  )
}

const MenuItemContent = (input: {
  primary: TranslatedText
  renderIcon?: (input: { class: string; width: number; height: number; fill: string; stroke: string }) => VDom
  end?: () => VDom
  secondary?: TranslatedText
}) => {
  return h(
    Box,
    {
      style: theme({
        height: 'full',
        flexDirection: 'row',
        flex: 1,
        items: 'center',
        gap: 3,
        overflow: 'hidden',
      }),
    },
    [
      input.renderIcon?.({
        class: 'size-8',
        width: 24,
        height: 24,
        fill: '#fff',
        stroke: '#fff',
      }),
      h(
        Box,
        {
          style: theme({
            flexDirection: 'col',
            gap: 1,
          }),
        },
        [
          h(Typography, {
            variant: 'body',
            style: theme({
              textColor: 'white',
              textSize: 'lg',
            }),
            text: input.primary,
          }),
          input.secondary &&
            h(Typography, {
              style: theme({
                textAlign: 'left',
                textSize: 'xs',
                textColor: 'neutral-300',
              }),
              text: input.secondary,
            }),
        ],
      ),
    ],
  )
}

type Color = 'default' | 'danger' | 'warning' | 'success' | 'inherit' | 'selected' | 'green' | 'orange'

const toColorStyle = (input: MenuItemProps) => {
  switch (input.color ?? 'default') {
    case 'warning': {
      return theme({ textColor: 'orange-500' })
    }
    case 'danger': {
      return theme({ textColor: 'red-500' })
    }
    case 'green': {
      return theme({ textColor: 'green-500' })
    }
    case 'orange': {
      return theme({ textColor: 'orange-500' })
    }
    default: {
      return {}
    }
  }
}

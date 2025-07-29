import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { Text } from '../vdom/primitives/text'
import { Clickable } from './clickable'
import { Spinner } from './spinner'
import { theme, Theme } from './theme/theme'

export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'soft'

export type ButtonColor = 'primary' | 'danger' | 'default'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

type Combo = `${ButtonVariant}-${ButtonColor}`

export type ButtonInput = {
  fab?: boolean
  text?: TranslatedText | string
  disabled?: boolean
  type?: 'button'
  class?: string
  onPress?: (event: unknown) => void
  renderIconStart?: (input: { class?: string; fill?: string; stroke?: string; style?: Record<string, unknown> }) => VDom
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  loading?: boolean
  width?: 'fit' | 'full' | 'flex-1'
  style?: Record<string, unknown>
}

export const Button = (input: ButtonInput) => {
  const size = input.size ?? 'lg'
  const variant = input.variant ?? 'outlined'
  const color = input.color ?? 'primary'
  const combo: Combo = `${variant}-${color}`

  const buttonStyle = theme({
    flexDirection: 'row',
    items: 'center',
    justify: 'center',
    rounded: 'md',
    ...toButtonStyle(combo),
    ...toSizeStyle(size),
  })

  const contentStyle = theme({
    flexDirection: 'row',
    items: 'center',
    justify: 'center',
    height: 'full',
  })

  const textStyle = theme({
    ...toTextStyle(combo),
    ...toTextSizeStyle(size),
    fontWeight: 'bold',
  })
  return h(
    Clickable,
    {
      disabled: input.disabled || input.loading,
      'data-fab': input.fab,
      style: {
        ...buttonStyle,
        position: 'relative',
        overflow: 'hidden',
        opacity: input.disabled ? 0.6 : 1,
        borderRadius: input.fab ? 30 : buttonStyle.borderRadius,
        ...input.style,
      },
      role: 'button',
      'aria-label': input.text ?? '',
      onPress: input.onPress,
    },
    [
      h(
        Box,
        {
          style: {
            ...contentStyle,
            gap: 8,
            opacity: input.loading ? 0 : 1,
          },
        },
        [
          input.renderIconStart?.({
            style: { ...toIconSizeStyle(size), ...textStyle },
            fill: 'currentColor',
            stroke: 'currentColor',
          }),
          h(Text, {
            text: input.text ?? '',
            style: {
              ...textStyle,
              overflow: 'hidden',
            },
          }),
        ],
      ),
      input.loading &&
        h(Spinner, {
          style: theme({
            position: 'absolute',
            inset: 0,
            flexDirection: 'row',
            items: 'center',
            justify: 'center',
          }),
          iconClass: 'h-12 w-12 text-white',
        }),
    ],
  )
}

const toIconSizeStyle = (size: ButtonSize): Theme => {
  switch (size) {
    case 'lg':
      return { width: 32, height: 32 }
    case 'md':
      return { width: 24, height: 24 }
    case 'sm':
      return { width: 16, height: 16 }
    case 'xs':
      return { width: 12, height: 12 }
  }
}

const toSizeStyle = (size: ButtonSize): Theme => {
  switch (size) {
    case 'lg':
      return { height: 12, px: 4 }
    case 'md':
      return { height: 10, px: 2 }
    case 'sm':
      return { height: 8, px: 2 }
    case 'xs':
      return { height: 4, px: 2 }
  }
}

const toTextSizeStyle = (size: ButtonSize): Theme => {
  switch (size) {
    case 'lg':
      return { textSize: 'xl' }
    case 'md':
      return { textSize: 'lg' }
    case 'sm':
      return { textSize: 'md' }
    case 'xs':
      return { textSize: 'sm' }
  }
}

const toButtonStyle = (combo: Combo): Theme => {
  switch (combo) {
    case 'contained-primary':
      return { backgroundColor: 'blue-600' }
    case 'contained-danger':
      return { backgroundColor: 'red-600' }
    case 'contained-default':
      return { borderWidth: 2, borderColor: 'blue-500/50' }
    case 'text-danger':
      return {}
    case 'outlined-default':
      return { borderWidth: 2 }
    case 'soft-primary':
      return { backgroundColor: 'blue-500/20' }
    case 'soft-danger':
      return { backgroundColor: 'red-500/20' }
    case 'soft-default':
      return { backgroundColor: 'neutral-300/20' }
    case 'text-primary':
      return {}
    case 'outlined-danger':
      return { borderWidth: 2, borderColor: 'red-500/50' }
    case 'outlined-primary':
      return { borderWidth: 2, borderColor: 'blue-500/50' }
    case 'text-default':
      return {}
  }
}

const toTextStyle = (combo: Combo): Theme => {
  switch (combo) {
    case 'contained-primary':
      return { textColor: 'white' }
    case 'contained-danger':
      return { textColor: 'white' }
    case 'contained-default':
      return { textColor: 'blue-500' }
    case 'text-danger':
      return { textColor: 'red-500', fontWeight: 'bold' }
    case 'outlined-default':
      return { textColor: 'neutral-300' }
    case 'soft-primary':
      return { textColor: 'blue-200' }
    case 'soft-danger':
      return { textColor: 'red-200' }
    case 'soft-default':
      return { textColor: 'neutral-300' }
    case 'text-primary':
      return { textColor: 'blue-500' }
    case 'outlined-danger':
      return { textColor: 'red-500' }
    case 'outlined-primary':
      return { textColor: 'blue-500' }
    case 'text-default':
      return { textColor: 'neutral-300' }
  }
}

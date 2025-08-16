import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { Text } from '../vdom/primitives/text'
import { Clickable } from './clickable'
import { Spinner } from './spinner'
import { sx, Sx } from '../vdom/style/sx'

export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'soft'

export type ButtonColor = 'primary' | 'danger' | 'default'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

type Combo = `${ButtonVariant}-${ButtonColor}`

export type ButtonInput = {
  fab?: boolean
  text?: TranslatedText | string
  disabled?: boolean
  type?: 'button'
  onPress?: (event: unknown) => void
  renderIconStart?: (input: { style?: Record<string, unknown> }) => VDom
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

  const buttonStyle = sx({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    rounded: 'md',
    ...toButtonStyle(combo),
    ...toSizeStyle(size),
  })

  const contentStyle = sx({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'full',
  })

  const textStyle = sx({
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
            style: { ...toIconSizeStyle(size), ...textStyle, textColor: 'currentColor' },
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
          style: sx({
            position: 'absolute',
            inset: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            size: 12,
          }),
        }),
    ],
  )
}

const toIconSizeStyle = (size: ButtonSize): Sx => {
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

const toSizeStyle = (size: ButtonSize): Sx => {
  switch (size) {
    case 'lg':
      return { height: 14, paddingX: 6 }
    case 'md':
      return { height: 12, paddingX: 4 }
    case 'sm':
      return { height: 10, paddingX: 4 }
    case 'xs':
      return { height: 8, paddingX: 2 }
  }
}

const toTextSizeStyle = (size: ButtonSize): Sx => {
  switch (size) {
    case 'lg':
      return { fontSize: 'xl' }
    case 'md':
      return { fontSize: 'lg' }
    case 'sm':
      return { fontSize: 'md' }
    case 'xs':
      return { fontSize: 'sm' }
  }
}

const toButtonStyle = (combo: Combo): Sx => {
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

const toTextStyle = (combo: Combo): Sx => {
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

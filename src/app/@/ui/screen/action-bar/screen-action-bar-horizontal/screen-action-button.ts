import { Spinner } from '~/@/ui/spinner'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { ScreenAction } from '../screen-action-bar-props'

export const ScreenActionButton = (input: ScreenAction & { style?: Record<string, unknown> }) => {
  const isDisabled = input.disabled || input.loading
  const size = input.size ?? 'md'
  if (input.hidden) return null
  const colorStyles = toColorStyles(input)
  return h(
    Pressable,
    {
      role: 'button',
      disabled: isDisabled,
      'aria-disabled': isDisabled,
      'aria-label': input.label,
      'aria-hidden': input.hidden,
      onPress: input.onPress,
      style: {
        ...theme({
          position: 'relative',
          flexDirection: 'col',
          alignItems: 'center',
          gap: 0.5,
          fontWeight: 'normal',
        }),
        ...colorStyles,
        ...input.style,
        ...(input.hidden ? { display: 'none' } : {}),
        ...(isDisabled ? { cursor: 'not-allowed', opacity: 0.5 } : {}),
        ...toSizeStyles(size),
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
              justifyContent: 'center',
              height: 'full',
              width: 'full',
              gap: 0.5,
            }),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            opacity: input.loading ? 0 : 1,
          },
        },
        [
          input.renderIcon({
            style: {
              ...toIconSizeStyles(size),
              ...colorStyles,
            },
          }),
          h(Typography, {
            variant: 'label',
            text: input.label,
            style: colorStyles,
          }),
        ],
      ),

      input.loading &&
        h(
          Box,
          {
            style: theme({
              position: 'absolute',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'full',
              width: 'full',
              inset: 0,
            }),
          },
          [
            h(Spinner, {
              style: toIconSizeStyles(size),
            }),
          ],
        ),
    ],
  )
}

const toColorStyles = (input: ScreenAction): Record<string, unknown> => {
  switch (input.color) {
    case 'danger':
      return theme({ textColor: 'red-500' })
    case 'success':
      return theme({ textColor: 'green-500' })
    case 'selected':
      return theme({ textColor: 'blue-500' })
    default:
      return theme({ textColor: 'white' })
  }
}

const toSizeStyles = (size: ScreenAction['size']): Record<string, unknown> => {
  switch (size) {
    case 'sm':
      return theme({ fontSize: 'xs' })
    case 'md':
    default:
      return theme({ fontSize: 'sm' })
  }
}

const toIconSizeStyles = (size: ScreenAction['size']): Record<string, unknown> => {
  switch (size) {
    case 'sm':
      return theme({ size: 6 })
    case 'md':
    default:
      return theme({ size: 8 })
  }
}

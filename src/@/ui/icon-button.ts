import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { ClickableTransparent } from './clickable'
import { sx } from './theme/theme'

type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export const IconButton = (input: {
  onPress?: (event: unknown) => void
  label: TranslatedText
  renderIcon: (input: { style: Record<string, unknown>; fill: string; stroke: string }) => VDom
  style?: Record<string, unknown>
  size?: IconButtonSize
  dataTestId?: string
  ariaLabel?: TranslatedText
}) => {
  return h(
    ClickableTransparent,
    {
      style: {
        ...sx({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          rounded: 'full',
        }),
        ...toSizeStyle(input.size ?? 'md'),
        ...input.style,
      },
      onPress: input.onPress,
      'aria-label': input.ariaLabel ?? input.label,
      'data-testid': input.dataTestId,
      role: 'button',
    },
    [
      input.renderIcon({
        style: sx({
          width: 'full',
          height: 'full',
        }),
        fill: 'white',
        stroke: 'white',
      }),
    ],
  )
}

export const IconButtonEmpty = (input: { size?: IconButtonSize }) => {
  return h(Box, { style: toSizeStyle(input.size ?? 'md') })
}

const toSizeStyle = (size: IconButtonSize): Record<string, unknown> => {
  switch (size) {
    case 'xs':
      return sx({
        width: 7,
        height: 7,
        padding: 1,
      })
    case 'sm':
      return sx({
        width: 8,
        height: 8,
        padding: 1.5,
      })
    case 'md':
      return sx({
        width: 10,
        height: 10,
        padding: 2,
      })
    case 'lg':
      return sx({
        width: 12,
        height: 12,
        padding: 2.5,
      })
  }
}

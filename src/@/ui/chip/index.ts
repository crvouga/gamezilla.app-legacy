import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { VDom } from '~/@/vdom/vdom'
import { Clickable } from '../clickable'
import { Theme, theme } from '../theme/theme'

export type ChipSize = 'sm' | 'lg'

export type ChipProps = {
  renderStartIcon?: (input: { style: Record<string, unknown> }) => VDom
  label: TranslatedText
  size: ChipSize
  onPress?: () => void
}

export const Chip = (input: ChipProps) => {
  return h(
    Tag,
    {
      tagName: typeof input.onPress === 'function' ? 'button' : 'div',
      style: theme({
        flexDirection: 'row',
        items: 'center',
        gap: 1,
        borderWidth: 1,
        borderColor: 'white/30',
        fontWeight: 'bold',
        ...toSizeStyles(input),
      }),
      onPress: input.onPress,
    },
    [
      input.renderStartIcon?.({
        style: theme({
          ...toIconSizeStyles(input),
          textColor: 'white',
        }),
      }),
      h(Text, {
        text: input.label,
        style: theme({
          textColor: 'white',
        }),
      }),
    ],
  )
}

const Tag = ({
  children,
  tagName,
  ...input
}: {
  children: VDom
  tagName: 'div' | 'button'
  onPress?: () => void
  style?: Record<string, unknown>
}) => {
  switch (tagName) {
    case 'button':
      return h(Clickable, input, [children])
    default:
      return h(Box, input, [children])
  }
}

const toSizeStyles = (input: ChipProps): Theme => {
  switch (input.size) {
    case 'sm':
      return {
        textSize: 'xs' as const,
        px: 2,
        py: 1,
        rounded: 'xl' as const,
      }
    case 'lg':
      return {
        textSize: 'md' as const,
        px: 2.5,
        py: 1.5,
        rounded: '2xl' as const,
      }
  }
}

const toIconSizeStyles = (input: ChipProps): Theme => {
  switch (input.size) {
    case 'sm':
      return {
        width: 4,
        height: 4,
      }
    case 'lg':
      return {
        width: 5,
        height: 5,
      }
  }
}

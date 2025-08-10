import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { VDom } from '~/@/vdom/vdom'
import { Clickable } from '../clickable'
import { Theme, sx } from '../theme/theme'

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
      style: sx({
        flexDirection: 'row',
        alignItems: 'center',
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
        style: toIconSizeStyles(input),
      }),
      h(Text, {
        text: input.label,
        style: sx({
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
        fontSize: 'xs' as const,
        paddingX: 2,
        paddingY: 1,
        rounded: 'xl' as const,
      }
    case 'lg':
      return {
        fontSize: 'md' as const,
        paddingX: 2.5,
        paddingY: 1.5,
        rounded: '2xl' as const,
      }
  }
}

const toIconSizeStyles = (props: ChipProps): Record<string, unknown> => {
  switch (props.size) {
    case 'sm':
      return sx({ size: 4 })
    case 'lg':
      return sx({ size: 5 })
  }
}

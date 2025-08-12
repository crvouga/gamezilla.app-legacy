import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '../vdom/primitives/pressable'
import { Text } from '../vdom/primitives/text'
import { sx } from './theme/theme'
import { Typography } from './typography'

export type ChipSelectionOption<T = string> = {
  value: T
  label: TranslatedText
}

export const ChipSelection = <T>(props: {
  label?: TranslatedText
  options: ChipSelectionOption<T>[]
  value: T
  onChange?: (newValue: T) => void
  disabled?: boolean
}) => {
  return h(Box, { style: sx({ flexDirection: 'col', gap: 2 }) }, [
    props.label
      ? h(Typography, { variant: 'label', text: props.label, style: sx({ fontSize: 'md', fontWeight: 'bold' }) })
      : null,
    h(
      Box,
      { style: sx({ flexDirection: 'row', gap: 3, flex: 1 }) },
      props.options.map((option) =>
        h(Chip<T>, {
          key: String(option.value),
          option,
          isSelected: props.value === option.value,
          disabled: props.disabled,
          onPress: () => {
            if (!props.disabled && props.value !== option.value) {
              props.onChange?.(option.value)
            }
          },
        }),
      ),
    ),
  ])
}

const Chip = <T>(props: {
  option: ChipSelectionOption<T>
  isSelected: boolean
  disabled?: boolean
  onPress?: () => void
}) => {
  return h(
    Pressable,
    {
      key: String(props.option.value),
      disabled: props.disabled,
      'aria-selected': props.isSelected,
      role: 'button',
      style: sx({
        paddingX: 5,
        paddingY: 2,
        rounded: 'full',
        borderWidth: 1,
        ...(props.isSelected
          ? {
              backgroundColor: 'blue-500',
              textColor: 'white',
              borderColor: 'blue-600',
            }
          : {
              backgroundColor: 'neutral-800',
              textColor: 'neutral-100',
              borderColor: 'neutral-700',
              hover: {
                backgroundColor: 'neutral-700',
              },
            }),
        ...(props.disabled && {
          opacity: 50,
          pointerEvents: 'none',
        }),
      }),
      onPress: props.onPress ?? undefined,
    },
    [h(Text, { text: props.option.label, style: sx({ fontSize: 'sm', textColor: 'white' }) })],
  )
}

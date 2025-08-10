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

export const ChipSelection = <T>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label?: TranslatedText
  options: ChipSelectionOption<T>[]
  value: T
  onChange?: (newValue: T) => void
  disabled?: boolean
}) => {
  return h(Box, {}, [
    label ? h(Typography, { variant: 'label', text: label }) : null,
    h(
      Box,
      {
        style: sx({
          flexDirection: 'row',
          gap: 3,
        }),
      },
      options.map((option) =>
        h(
          Pressable,
          {
            key: String(option.value),
            disabled: disabled,
            'aria-selected': value === option.value,
            role: 'button',
            style: {
              ...sx({
                paddingX: 5,
                paddingY: 2,
                rounded: 'full',
                borderWidth: 1,
                ...(value === option.value
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
                ...(disabled && {
                  opacity: 50,
                  pointerEvents: 'none',
                }),
              }),
            },
            onPress: () => {
              if (!disabled && value !== option.value) {
                onChange?.(option.value)
              }
            },
          },
          [h(Text, { text: option.label })],
        ),
      ),
    ),
  ])
}

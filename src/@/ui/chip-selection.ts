import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '../vdom/primitives/pressable'
import { Typography } from './typography'
import { Text } from '../vdom/primitives/text'

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
        class: 'flex flex-row gap-3 flex-wrap', // increased gap for bigger chips
      },
      options.map((option) =>
        h(
          Pressable,
          {
            key: String(option.value),
            disabled: disabled,
            'aria-selected': value === option.value,
            role: 'button',
            class: [
              // Bigger padding, larger text, dark mode colors
              'px-5 py-2 rounded-full border transition-colors text-base font-medium',
              value === option.value
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-neutral-800 text-neutral-100 border-neutral-700 hover:bg-neutral-700',
              disabled ? 'opacity-50 pointer-events-none' : '',
            ].join(' '),
            onPressDown: () => {
              if (!disabled && value !== option.value) {
                onChange?.(option.value)
              }
            },
          },
          [Text({ text: option.label })],
        ),
      ),
    ),
  ])
}

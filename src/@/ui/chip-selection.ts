import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Touchable } from '../vdom/primitives/touchable'
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
        class: 'flex flex-row gap-2 flex-wrap',
      },
      options.map((option) =>
        h(
          Touchable,
          {
            key: String(option.value),
            disabled: disabled,
            'aria-pressed': value === option.value ? 'true' : 'false',
            role: 'button',
            class: [
              'px-3 py-1 rounded-full border transition-colors',
              value === option.value
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50',
              disabled ? 'opacity-50 pointer-events-none' : '',
            ].join(' '),
            onClick: () => {
              if (!disabled && value !== option.value) {
                onChange?.(option.value)
              }
            },
          },
          [option.label],
        ),
      ),
    ),
  ])
}

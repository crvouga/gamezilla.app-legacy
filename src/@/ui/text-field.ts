import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { TextInput } from '~/@/vdom/primitives/text-input'
import type { VDom } from '~/@/vdom/vdom'
import { Text } from '../vdom/primitives/text'
import { IconXMark } from './icon'
import { PAPER_STYLE } from './paper'
import { sx } from './theme/theme'

export const TextField = (input: {
  startIcon?: VDom
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'
  autoFocus?: boolean
  testId?: string
  id: string
  label: TranslatedText
  value: string | number
  error?: boolean
  helperText?: TranslatedText | null
  min?: number
  max?: number
  step?: number
  onClear?: () => void
  onChangeText: (value: string) => void
}) => {
  return h(Box, { style: sx({ width: 'full', flexDirection: 'col', gap: 1 }) }, [
    h(Text, {
      text: input.label,
      style: {
        ...sx({ fontSize: 'sm' }),
        textColor: input.error ? 'red-500' : 'white',
      },
    }),
    h(
      Box,
      {
        style: {
          ...PAPER_STYLE,
          ...sx({
            flexDirection: 'row',
            height: 20,
            width: 'full',
            overflow: 'hidden',
            rounded: 'md',
            borderWidth: 2,
          }),
          ...(input.error
            ? {
                borderColor: 'red-500',
                textColor: 'red-500',
              }
            : {
                ringColor: 'blue-500',
                ringWidth: 2,
                ringOpacity: 0,
                ':focus-within': {
                  ringOpacity: 1,
                },
              }),
        },
      },
      [
        h(TextInput, {
          role: 'textbox',
          'data-testid': input.testId,
          'aria-label': input.label,
          id: input.id,
          type: input.type,
          defaultValue: input.value,
          onChangeText: input.onChangeText,
          style: {
            ...sx({
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              gap: 2,
              padding: 3,
              fontSize: 'lg',
            }),
            backgroundColor: 'transparent',
          },
        }),
        input.onClear &&
          typeof input.value === 'string' &&
          input.value.length > 0 &&
          h(
            Pressable,
            {
              style: {
                ...sx({
                  rounded: 'md',
                  paddingX: 3,
                }),
              },
              'aria-label': 'Clear input',
              onPress: (_e: any) => {
                input.onClear?.()
              },
            },
            [h(IconXMark, { style: sx({ size: 6, textColor: 'white' }) })],
          ),
      ],
    ),
    typeof input.helperText === 'string' &&
      h(
        Box,
        {
          role: 'alert',
          'data-error': input.error,
          'data-info': !input.error,
          style: {
            ...sx({ fontSize: 'sm' }),
            textColor: input.error ? 'red-500' : 'neutral-300',
          },
        },
        [h(Text, { text: input.helperText ?? '' })],
      ),
  ])
}

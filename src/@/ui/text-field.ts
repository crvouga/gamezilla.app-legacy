import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { TextInput } from '~/@/vdom/primitives/text-input'
import type { VDom } from '~/@/vdom/vdom'
import { Text } from '../vdom/primitives/text'
import { cn } from './cn'
import { IconXMark } from './icon'
import { PAPER_CLASS_NAME } from './paper'

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
  return h(Box, { class: 'flex w-full flex-col gap-1' }, [
    h(Text, { class: cn('text-base', input.error && 'text-red-500'), text: input.label }),
    h(
      Box,
      {
        class: cn(
          PAPER_CLASS_NAME,
          'flex flex-row h-20 w-full overflow-hidden rounded-md border-2',
          input.error && 'border-2 border-red-500 text-red-500',
          !input.error && 'ring-blue-500 focus-within:ring-2',
        ),
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
          class: cn(
            'flex flex-row flex-1 appearance-none items-center gap-2 bg-transparent p-3 py-4 text-xl outline-none',
            '[&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:!shadow-[0_0_0_1000px_#000000_inset] [&:-webkit-autofill]:![-webkit-text-fill-color:white]',
          ),
        }),
        input.onClear &&
          typeof input.value === 'string' &&
          input.value.length > 0 &&
          h(
            Pressable,
            {
              class: 'rounded-md px-3 ring-blue-500 outline-none focus:ring-2',
              'aria-label': 'Clear input',
              onPress: (_e: any) => {
                input.onClear?.()
              },
            },
            [h(IconXMark, { class: 'size-6 text-white' })],
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
          class: cn('text-sm', input.error && 'text-red-500'),
        },
        [h(Text, { text: input.helperText ?? '' })],
      ),
  ])
}

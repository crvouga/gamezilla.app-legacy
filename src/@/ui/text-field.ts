import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { TextInput } from '~/@/vdom/primitives/text-input'
import { Touchable } from '~/@/vdom/primitives/touchable'
import type { VDom } from '~/@/vdom/vdom'
import { Text } from '../vdom/primitives/svg/text'
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
  onChange: (value: string) => void
}) => {
  return h(Box, { class: 'flex w-full flex-col gap-1' }, [
    Text({ class: cn('text-base', input.error && 'text-red-500'), text: input.label }),
    h(
      Box,
      {
        class: cn(
          PAPER_CLASS_NAME,
          'flex h-fit w-full flex-row overflow-hidden rounded-md border-2',
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
          autoFocus: input.autoFocus,
          type: input.type,
          min: input.min,
          max: input.max,
          'auto-complete': 'off',
          'auto-capitalize': 'off',
          'auto-correct': 'off',
          'auto-save': 'off',
          step: input.step,
          key: input.id,
          // value: input.value,
          // defaultValue: input.value,
          onInput: (e: unknown) => {
            if (
              typeof e === 'object' &&
              e !== null &&
              'preventDefault' in e &&
              typeof e.preventDefault === 'function'
            ) {
              e.preventDefault()
            }
            const valueNew = eventToInputValue(e)
            input.onChange(valueNew)
          },
          class: cn(
            'flex flex-1 appearance-none items-center gap-2 bg-transparent p-3 py-4 text-xl outline-none',
            '[&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:!shadow-[0_0_0_1000px_#000000_inset] [&:-webkit-autofill]:![-webkit-text-fill-color:white]',
          ),
        }),
        input.onClear &&
          typeof input.value === 'string' &&
          input.value.length > 0 &&
          h(
            Touchable,
            {
              class: 'rounded-md px-3 ring-blue-500 outline-none focus:ring-2',
              'aria-label': 'Clear input',
              type: 'button',
              onClick: (e: any) => {
                e.preventDefault()
                const self = document.getElementById(input.id)
                if (self instanceof HTMLInputElement) {
                  self.focus()
                  self.value = ''
                }

                input.onClear?.()
              },
            },
            [h(IconXMark, { class: 'size-6' })],
          ),
      ],
    ),
    typeof input.helperText === 'string' &&
      h(
        Box,
        {
          role: 'alert',
          'data-error': input.error ? 'true' : 'false',
          'data-info': input.error ? 'false' : 'true',
          class: cn('text-sm', input.error && 'text-red-500'),
        },
        [Text({ text: input.helperText ?? '' })],
      ),
  ])
}

const eventToInputValue = (e: unknown): string => {
  let valueNew: string =
    typeof e === 'object' &&
    e !== null &&
    'currentTarget' in e &&
    e.currentTarget !== null &&
    typeof e.currentTarget === 'object' &&
    'value' in e.currentTarget &&
    typeof e.currentTarget.value === 'string'
      ? e.currentTarget.value
      : ''

  if (valueNew.length === 0) {
    valueNew =
      typeof e === 'object' &&
      e !== null &&
      'nativeEvent' in e &&
      typeof e.nativeEvent === 'object' &&
      e.nativeEvent !== null &&
      'data' in e.nativeEvent &&
      typeof e.nativeEvent.data === 'string'
        ? e.nativeEvent.data
        : ''
  }

  if (valueNew.length === 0) {
    valueNew = typeof e === 'object' && e !== null && 'data' in e && typeof e.data === 'string' ? e.data : ''
  }

  return valueNew
}

import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
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
  return h('div', { class: 'flex w-full flex-col gap-1' }, [
    h('label', { htmlFor: input.id, class: cn('text-base', input.error && 'text-red-500') }, [input.label]),
    h(
      'div',
      {
        class: cn(
          PAPER_CLASS_NAME,
          'flex h-fit w-full flex-row overflow-hidden rounded-md border-2',
          input.error && 'border-2 border-red-500 text-red-500',
          !input.error && 'ring-blue-500 focus-within:ring-2',
        ),
      },
      [
        h('input', {
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
          value: input.value,
          defaultValue: input.value,
          onInput: (e: { preventDefault: () => void; currentTarget: { value: string } }) => {
            e.preventDefault()
            const valueNew = eventToInputValue(e)
            input.onChange(valueNew)
          },
          class: cn(
            'flex flex-1 appearance-none items-center gap-2 bg-transparent p-3 py-4 text-xl outline-none',
            '[&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:!shadow-[0_0_0_1000px_#000000_inset] [&:-webkit-autofill]:![-webkit-text-fill-color:white]',
          ),
        }),
        input.onClear &&
          input.value &&
          input.value?.toString().length > 0 &&
          h(
            'button',
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
    input.helperText &&
      h(
        'div',
        {
          role: 'alert',
          'data-error': input.error ? 'true' : 'false',
          'data-info': input.error ? 'false' : 'true',
          class: cn('text-sm', input.error && 'text-red-500'),
        },
        [input.helperText],
      ),
  ])
}

const eventToInputValue = (e: { preventDefault: () => void; currentTarget: { value: string } }): string => {
  let valueNew: string = e.currentTarget.value

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

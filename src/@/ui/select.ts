import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { Text } from '../vdom/primitives/text'
import { cn } from './cn'
import { PAPER_CLASS_NAME } from './paper'

export const Select = <T>(props: {
  helperText?: string
  dataTestId?: string
  id: string
  label: TranslatedText
  options: T[]
  value?: T | null
  error?: boolean
  toKey: (option: T) => string
  toName: (option: T) => string
  startIcon?: VDom
  onChange: (value: T) => void
}) => {
  const labelId = `${props.id}-label`
  return h(Box, { class: 'flex w-full flex-col gap-1', 'data-testid': props.dataTestId }, [
    h(Text, {
      id: labelId,
      class: cn('text-base', props.error && 'text-red-500'),
      text: props.label,
    }),
    h(
      // @ts-ignore
      'select',
      {
        id: props.id,
        class: cn(
          PAPER_CLASS_NAME,
          'flex flex-row appearance-none items-center rounded-md border p-3 py-4 text-xl outline-none',
          props.error && 'border-red-500 text-red-500',
          !props.error && 'border-neutral-600 ring-blue-500 focus:ring-2',
        ),
        value: props.value ? props.toKey(props.value) : undefined,
        'default-value': props.value ? props.toKey(props.value) : undefined,
        'aria-labelledby': labelId,
        onChange: (e: { currentTarget: { value: string } }) => {
          for (const option of props.options) {
            if (props.toKey(option) === e.currentTarget.value) {
              props.onChange(option)
              return
            }
          }
        },
      },
      props.options.map((option) => {
        const isSelected = props.value && props.toKey(option) === props.toKey(props.value)
        return h(
          // @ts-ignore
          'option',
          {
            key: props.toKey(option),
            value: props.toKey(option),
            'data-selected': isSelected ? 'true' : 'false',
            selected: isSelected ? 'true' : undefined,
          },
          [props.toName(option)],
        )
      }),
    ),
    typeof props.helperText === 'string' &&
      h(Box, { class: cn('text-sm', props.error && 'text-red-500') }, [h(Text, { text: props.helperText })]),
  ])
}

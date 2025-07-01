import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { v } from '~/@/vdom/v'
import { cn } from './cn'
import { PAPER_CLASS_NAME } from './paper'

export const Select = <T>({
  onChange,
  options,
  value,
  label,
  id,
  toKey,
  toName,
  error,
  helperText,
}: {
  helperText?: string
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
  const labelId = `${id}-label`
  return v('div', { class: 'flex w-full flex-col gap-1' }, [
    v('label', { id: labelId, htmlFor: id, class: cn('text-base', error && 'text-red-500') }, [label]),
    v(
      'select',
      {
        id: id,
        class: cn(
          PAPER_CLASS_NAME,
          'flex appearance-none items-center rounded-md border p-3 py-4 text-xl outline-none',
          error && 'border-red-500 text-red-500',
          !error && 'border-neutral-600 ring-blue-500 focus:ring-2',
        ),
        'aria-labelledby': labelId,
        value: value ? toKey(value) : undefined,
        onChange: (e: { currentTarget: { value: string } }) => {
          for (const option of options) {
            if (toKey(option) === e.currentTarget.value) {
              onChange(option)
              return
            }
          }
        },
      },
      options.map((option) => {
        return v('option', { key: toKey(option), value: toKey(option) }, [toName(option)])
      }),
    ),
    helperText && v('div', { class: cn('text-sm', error && 'text-red-500') }, [helperText]),
  ])
}

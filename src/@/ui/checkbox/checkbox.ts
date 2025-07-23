import { h } from '~/@/vdom/h'
import { Text } from '~/@/vdom/primitives/text'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { cn } from '../cn'

export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate'

export const Checkbox = (input: { state: CheckboxState; onChange?: (checkedNew: boolean) => void }) => {
  const element = input.onChange ? 'button' : 'div'
  const isChecked = input.state === 'checked'
  return h(
    Pressable,
    {
      class: cn(
        'flex flex-row size-6 items-center justify-center rounded border-2 border-neutral-500 text-xl font-black text-neutral-800',
        input.state !== 'unchecked' && 'border-neutral-100 bg-neutral-100',
      ),
      role: 'checkbox',
      'aria-checked': input.state === 'checked' ? 'true' : 'false',
      tabIndex: element === 'button' ? 0 : undefined,
      onClick: () => {
        input.onChange?.(!isChecked)
      },
      onKeyDown: (e: unknown) => {
        if (element === 'button' && typeof e === 'object' && e !== null && 'key' in e && e.key === 'Enter') {
          input.onChange?.(!isChecked)
        }
      },
    },
    [Text({ text: toCheckboxText(input.state) })],
  )
}

const toCheckboxText = (state: CheckboxState): string => {
  switch (state) {
    case 'checked':
      return '✓'
    case 'unchecked':
      return ''
    case 'indeterminate':
      return '—'
  }
}

import { v } from '~/@/vdom/v'
import { cn } from '../cn'
import { DynamicElement, OnKeyDownEvent } from '../dynamic-element'

export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate'

export const Checkbox = (input: { state: CheckboxState; onChange?: (checkedNew: boolean) => void }) => {
  const element = input.onChange ? 'button' : 'div'
  const isChecked = input.state === 'checked'
  return v(
    DynamicElement,
    {
      element,
      className: cn(
        'flex size-6 items-center justify-center rounded border-2 border-neutral-500 text-xl font-black text-neutral-800',
        input.state !== 'unchecked' && 'border-neutral-100 bg-neutral-100',
      ),
      role: 'checkbox',
      'aria-checked': input.state === 'checked',
      tabIndex: element === 'button' ? 0 : undefined,
      onClick: () => {
        input.onChange?.(!isChecked)
      },
      onKeyDown: (e: OnKeyDownEvent) => {
        if (element === 'button' && e.key === 'Enter') {
          e.preventDefault()
          input.onChange?.(!isChecked)
        }
      },
    },
    [toCheckboxText(input.state)],
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

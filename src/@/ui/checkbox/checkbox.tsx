import { cn } from '../cn'

export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate'

export const Checkbox = (input: { state: CheckboxState; onChange?: (checked: boolean) => void }) => {
  const Element = input.onChange ? 'button' : 'div'
  const isChecked = input.state === 'checked'
  return (
    <button
      className={cn(
        'flex size-6 items-center justify-center rounded border-2 border-neutral-500 text-xl font-black text-neutral-800',
        input.state !== 'unchecked' && 'border-neutral-100 bg-neutral-100',
      )}
      role='checkbox'
      aria-checked={input.state === 'checked'}
      tabIndex={Element === 'button' ? 0 : undefined}
      onClick={() => {
        input.onChange?.(!isChecked)
      }}
      onKeyDown={(e) => {
        if (Element === 'button' && e.key === 'Enter') {
          e.preventDefault()
          input.onChange?.(!isChecked)
        }
      }}
    >
      {toCheckboxText(input.state)}
    </button>
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

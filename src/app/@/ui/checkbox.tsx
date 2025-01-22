export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate'

export const Checkbox = (input: { state: CheckboxState; onChange?: (checked: boolean) => void }) => {
  return (
    <label className='flex cursor-pointer items-center'>
      <input
        type='checkbox'
        checked={input.state === 'checked' || input.state === 'indeterminate'}
        onChange={(e) =>
          input.onChange?.(
            // @ts-ignore
            e.target?.checked,
          )
        }
        className='peer hidden'
      />
      <div className='flex size-6 items-center justify-center rounded border-2 border-neutral-500 text-xl font-black text-neutral-800 peer-checked:border-neutral-100 peer-checked:bg-neutral-100'>
        {toCheckboxText(input.state)}
      </div>
    </label>
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

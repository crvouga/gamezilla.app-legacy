export const Checkbox = (input: { checked: boolean; onChange?: (checked: boolean) => void }) => {
  return (
    <label className='flex cursor-pointer items-center'>
      <input
        type='checkbox'
        checked={input.checked}
        onChange={(e) =>
          input.onChange?.(
            // @ts-ignore
            e.target?.checked,
          )
        }
        className='peer hidden'
      />
      <div className='flex size-6 items-center justify-center rounded border-2 border-gray-300 text-white peer-checked:bg-blue-500'>
        {input.checked ? '✓' : ''}
      </div>
    </label>
  )
}

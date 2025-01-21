import React from 'react'

export const Checkbox = (input: { checked: boolean; onChange: (checked: boolean) => void }) => {
  return (
    <label className='flex cursor-pointer items-center'>
      <input
        type='checkbox'
        checked={input.checked}
        onChange={(e) => input.onChange(e.target.checked)}
        className='peer hidden'
      />
      <div className='flex h-5 w-5 items-center justify-center rounded-md border-2 border-gray-300 peer-checked:bg-blue-500'>
        {input.checked && <div className='h-3 w-3 rounded-md bg-white' />}
      </div>
    </label>
  )
}

import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { cn } from './cn'
import { IconXMark } from './icon'

export const TextField = (input: {
  startIcon?: VDom
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'
  autoFocus?: boolean
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
  return (
    <label className='flex w-full flex-col gap-1'>
      <label htmlFor={input.id} className={cn('text-base', input.error && 'text-red-500')}>
        {input.label}
      </label>

      <div
        className={cn(
          'bg-paper flex h-fit w-full flex-row overflow-hidden rounded-md border-2',
          input.error && 'border-2 border-red-500 text-red-500',
          !input.error && 'ring-blue-600 focus-within:ring-2',
        )}
      >
        <input
          role='textbox'
          aria-label={input.label}
          id={input.id}
          autoFocus={input.autoFocus}
          type={input.type}
          min={input.min}
          max={input.max}
          auto-complete='off'
          auto-capitalize='off'
          auto-correct='off'
          auto-save='off'
          step={input.step}
          // Controlled inputs are bugging out in React and Inferno. The cursor jumps to the end of the input on every change.
          // value={input.value}
          defaultValue={input.value}
          onInput={(e) => {
            e.preventDefault()
            input.onChange(e.currentTarget.value)
          }}
          className='flex flex-1 appearance-none items-center gap-2 bg-transparent p-3 py-4 text-xl outline-none'
          style={{
            background: 'transparent !important',
          }}
        />
        {input.onClear && input.value && input.value?.toString().length > 0 && (
          <button
            className='rounded-md px-3 outline-none ring-blue-600 focus:ring-2'
            aria-label='Clear input'
            type='button'
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(input.id)?.focus()
              input.onClear?.()
            }}
          >
            <IconXMark className='size-6' />
          </button>
        )}
      </div>

      {input.helperText && <div className={cn('text-sm', input.error && 'text-red-500')}>{input.helperText}</div>}
    </label>
  )
}

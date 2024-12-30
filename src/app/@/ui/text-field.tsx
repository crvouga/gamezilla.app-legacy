import type { VDom } from '~/@/vdom'
import { IconXMark } from './icon'
import { cn } from './cn'
import { TranslatedText } from '~/@/l18n'

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
          'flex h-fit w-full flex-row overflow-hidden rounded-md border-2 bg-neutral-800',
          input.error && 'border-2 border-red-500 text-red-500',
          !input.error && 'ring-blue-600 focus-within:ring-2'
        )}
      >
        <input
          role='textbox'
          aria-label={input.label}
          id={input.id}
          autoFocus={input.autoFocus}
          type={input.type}
          value={input.value}
          min={input.min}
          max={input.max}
          auto-complete='off'
          auto-capitalize='off'
          auto-correct='off'
          auto-save='off'
          step={input.step}
          onInput={(e) => {
            e.preventDefault()
            input.onChange(e.currentTarget.value)
          }}
          className='flex flex-1 appearance-none items-center gap-2 bg-transparent p-3 py-4 text-xl outline-none'
          style={{
            background: 'transparent !important'
          }}
        />
        {input.onClear && input.value && input.value?.toString().length > 0 && (
          <button
            className='rounded-md px-3 ring-blue-600 outline-none focus:ring-2'
            aria-label='Clear input'
            type='button'
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(input.id)?.focus()
              input.onClear?.()
            }}
          >
            <IconXMark className='h-6 w-6' />
          </button>
        )}
      </div>

      {input.helperText && <div className={cn('text-sm', input.error && 'text-red-500')}>{input.helperText}</div>}
    </label>
  )
}

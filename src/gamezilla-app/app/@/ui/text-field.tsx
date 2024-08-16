import type { VDom } from 'gamezilla-app/@/vdom'
import { IconXMark } from './icon'
import { cn } from './ui'
import { TranslatedText } from 'gamezilla-app/@/l18n'

export const TextField = (input: {
  startIcon?: VDom
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'
  autoFocus?: boolean
  id: string
  label: TranslatedText
  value?: string | number
  error?: boolean
  helperText?: TranslatedText | null
  min?: number
  max?: number
  step?: number
  onClear?: () => void
  onChange: (value: string) => void
}) => {
  return (
    <div className='flex w-full flex-col gap-1'>
      <label htmlFor={input.id} className={cn('text-base', input.error && 'text-red-500')}>
        {input.label}
      </label>

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
        className={cn(
          'flex appearance-none items-center gap-2 rounded-md border border-neutral-600 bg-neutral-800 p-3 py-4 text-xl outline-none',
          input.error && 'border border-red-500 text-red-500',
          !input.error && ' ring-blue-600 focus-within:ring-2'
        )}
        style={{
          background: 'transparent !important'
        }}
      />
      {input.onClear && input.value && input.value?.toString().length > 0 && (
        <button
          className='rounded-md outline-none ring-blue-600 focus:ring-2'
          aria-label='Clear input'
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(input.id)?.focus()
            input.onClear?.()
          }}
        >
          <IconXMark className='h-6 w-6' />
        </button>
      )}

      {input.helperText && <div className={cn('text-sm', input.error && 'text-red-500')}>{input.helperText}</div>}
    </div>
  )
}

import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { cn } from './cn'
import { IconXMark } from './icon'
import { PAPER_CLASS_NAME } from './paper'

export const TextField = (input: {
  startIcon?: VDom
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'
  autoFocus?: boolean
  dataTestId?: string
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
          PAPER_CLASS_NAME,
          'flex h-fit w-full flex-row overflow-hidden rounded-md border-2',
          input.error && 'border-2 border-red-500 text-red-500',
          !input.error && 'ring-blue-500 focus-within:ring-2',
        )}
      >
        <input
          role='textbox'
          data-testid={input.dataTestId}
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
            let valueNew: string = e.currentTarget.value

            if (valueNew.length === 0)
              valueNew = 'data' in e.nativeEvent && typeof e.nativeEvent.data === 'string' ? e.nativeEvent.data : ''

            input.onChange(valueNew)
          }}
          className={cn(
            'flex flex-1 appearance-none items-center gap-2 bg-transparent p-3 py-4 text-xl outline-none',
            '[&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:!shadow-[0_0_0_1000px_#000000_inset] [&:-webkit-autofill]:![-webkit-text-fill-color:white]',
          )}
        />
        {input.onClear && input.value && input.value?.toString().length > 0 && (
          <button
            className='rounded-md px-3 ring-blue-500 outline-none focus:ring-2'
            aria-label='Clear input'
            type='button'
            onClick={(e) => {
              e.preventDefault()
              const self = document.getElementById(input.id)
              if (self instanceof HTMLInputElement) {
                self.focus()
                self.value = ''
              }

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

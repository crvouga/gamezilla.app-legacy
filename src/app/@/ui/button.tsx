import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom'
import { Spinner } from './spinner'
import { cn } from './cn'

export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'soft'

export type ButtonColor = 'primary' | 'danger' | 'default'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

type VariantColor = `${ButtonVariant}-${ButtonColor}`

export type ButtonEvent = {
  stopPropagation: () => void
}

export const Button = (input: {
  fab?: boolean
  text?: TranslatedText
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  onClick?: (msgEvt: ButtonEvent) => void
  iconStart?: (input: { className?: string }) => VDom
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  loading?: boolean
}) => {
  const combo: VariantColor = `${input.variant ?? 'soft'}-${input.color ?? 'primary'}`

  return (
    <button
      disabled={input.disabled || input.loading}
      type={input.type}
      className={cn(
        input.className,
        'relative flex shrink-0 select-none appearance-none flex-nowrap items-center justify-center overflow-hidden rounded font-semibold outline-none focus:ring-2',

        combo === 'contained-primary' && 'bg-blue-600 text-white ring-blue-500',

        combo === 'contained-danger' && 'bg-red-600 text-white ring-red-500',

        combo === 'contained-default' && 'border-2 border-blue-500/40  text-blue-500 ring-blue-500',

        combo === 'text-danger' && 'font-bold text-red-500',

        combo === 'outlined-default' && 'text-secondary border text-inherit',

        combo === 'soft-primary' && 'bg-blue-500/20 text-blue-200',

        combo === 'soft-danger' && 'bg-red-500/20 text-red-200',

        combo === 'soft-default' && 'bg-secondary/20 text-secondary',

        !input.disabled && combo === 'text-primary' && 'text-blue-500',

        input.fab && 'rounded-3xl',

        input.size === 'lg' && 'px-4 py-3 text-xl',
        input.size === 'md' && 'px-4 py-2 text-lg',
        input.size === 'sm' && 'text-md  px-4 py-1',
        input.size === 'xs' && 'px-3 py-1 text-sm',

        input.disabled && 'cursor-not-allowed opacity-60',
        !input.disabled && !input.loading && ' active:opacity-70',
        input.loading && 'cursor-wait opacity-70'
      )}
      role='button'
      onClick={(e) => input.onClick?.({ stopPropagation: () => e.stopPropagation() })}
    >
      <div className={cn('flex h-full w-full items-center justify-center', input.loading && 'text-transparent')}>
        {input.iconStart?.({ className: 'mr-2 w-7 h-7' })}
        {input.text}
      </div>

      {input.loading && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <Spinner className='h-7 w-7' />
        </div>
      )}
    </button>
  )
}

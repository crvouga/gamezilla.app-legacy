import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { Spinner } from './spinner'
import { cn } from './cn'

export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'soft'

export type ButtonColor = 'primary' | 'danger' | 'default'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

type Combo = `${ButtonVariant}-${ButtonColor}`

export type ButtonEvent = {
  stopPropagation: () => void
}

type ButtonInput = {
  rounded?: boolean
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
}

export const Button = (input: ButtonInput) => {
  return (
    <button
      disabled={input.disabled || input.loading}
      type={input.type ?? 'button'}
      className={cn(
        input.className,
        BASE_CLASS,
        toColorClass(input),
        toSizeClass(input),
        input.rounded && 'rounded-3xl shadow-2xl',
        input.disabled && 'cursor-not-allowed opacity-60',
        input.loading && 'cursor-wait opacity-70',
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

const BASE_CLASS =
  'clickable relative flex shrink-0 select-none appearance-none flex-nowrap items-center justify-center overflow-hidden rounded font-semibold'

const toSizeClass = (input: ButtonInput): string => {
  switch (input.size ?? 'lg') {
    case 'lg':
      return 'px-4 py-3 text-xl'
    case 'md':
      return 'px-4 py-2 text-lg'
    case 'sm':
      return 'text-md  px-4 py-1'
    case 'xs':
      return 'px-3 py-1 text-sm'
  }
}

const toColorClass = (input: ButtonInput): string => {
  const combo: Combo = `${input.variant ?? 'outlined'}-${input.color ?? 'primary'}`
  switch (combo) {
    case 'contained-primary':
      return 'bg-blue-600 text-white ring-blue-500'
    case 'contained-danger':
      return 'bg-red-600 text-white ring-red-500'
    case 'contained-default':
      return 'border-2 border-blue-500/50  text-blue-500 ring-blue-500'
    case 'text-danger':
      return 'font-bold text-red-500'
    case 'outlined-default':
      return 'text-secondary border-2 text-inherit'
    case 'soft-primary':
      return 'bg-blue-500/20 text-blue-200'
    case 'soft-danger':
      return 'bg-red-500/20 text-red-200'
    case 'soft-default':
      return 'bg-secondary/20 text-secondary'
    case 'text-primary':
      return 'text-blue-500'
    case 'outlined-danger':
      return 'border-2 border-red-500/50 text-red-500'
    case 'outlined-primary':
      return 'border-2 border-blue-500/50 text-blue-500'
    case 'text-default':
      return 'text-secondary'
  }
}

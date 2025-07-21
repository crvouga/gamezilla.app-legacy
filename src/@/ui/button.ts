import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'
import { Clickable } from './clickable'
import { cn } from './cn'
import { Spinner } from './spinner'

export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'soft'

export type ButtonColor = 'primary' | 'danger' | 'default'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

type Combo = `${ButtonVariant}-${ButtonColor}`

export type ButtonEvent = {
  stopPropagation: () => void
  currentTarget: HTMLButtonElement
}

export type ButtonInput = {
  fab?: boolean
  text?: TranslatedText
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  class?: string
  onClick?: (event: ButtonEvent) => void
  renderIconStart?: (input: { class?: string }) => VDom
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  loading?: boolean
  dataTestId?: string
}

export const Button = (input: ButtonInput) => {
  return h(
    Clickable,
    {
      dataTestId: input.dataTestId,
      disabled: input.disabled || input.loading,
      type: input.type ?? 'button',
      'data-fab': input.fab ? 'true' : 'false',
      class: cn(
        input.class,
        'relative flex shrink-0 appearance-none flex-nowrap items-center justify-center truncate overflow-hidden rounded font-semibold select-none',
        toColorClass(input),
        toSizeClass(input),
        input.fab && 'rounded-3xl shadow-2xl',
        input.disabled && 'cursor-not-allowed opacity-60',
        input.loading && 'cursor-wait opacity-70',
      ),
      role: 'button',
      'aria-label': input.text ?? '',
      onClick: (e) =>
        input.onClick?.({
          currentTarget: e.currentTarget as HTMLButtonElement,
          stopPropagation: () => e.stopPropagation(),
        }),
    },

    [
      h('div', { class: cn('flex h-full w-full items-center justify-center', input.loading && 'text-transparent') }, [
        h('div', { class: 'flex-none' }, [input.renderIconStart?.({ class: cn(toIconSizeClass(input), 'mr-2') })]),
        h('div', { class: 'truncate' }, [input.text]),
      ]),
      input.loading &&
        h('div', { class: 'absolute inset-0 flex items-center justify-center' }, [h(Spinner, { class: 'size-8' })]),
    ],
  )
}

const toIconSizeClass = (input: ButtonInput): string => {
  switch (input.size ?? 'lg') {
    case 'lg':
      return 'size-8'
    case 'md':
      return 'size-6'
    case 'sm':
      return 'size-4'
    case 'xs':
      return 'size-3'
  }
}

const toSizeClass = (input: ButtonInput): string => {
  switch (input.size ?? 'lg') {
    case 'lg':
      return 'px-4 py-3 text-xl'
    case 'md':
      return 'px-4 py-2 text-lg'
    case 'sm':
      return 'text-md  px-4 py-1.5'
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
      return 'text-neutral-300 border-2 text-inherit'
    case 'soft-primary':
      return 'bg-blue-500/20 text-blue-200'
    case 'soft-danger':
      return 'bg-red-500/20 text-red-200'
    case 'soft-default':
      return 'bg-neutral-300/20 text-neutral-300'
    case 'text-primary':
      return 'text-blue-500'
    case 'outlined-danger':
      return 'border-2 border-red-500/50 text-red-500'
    case 'outlined-primary':
      return 'border-2 border-blue-500/50 text-blue-500'
    case 'text-default':
      return 'text-neutral-300'
  }
}

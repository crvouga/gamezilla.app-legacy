import { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { Text } from '../vdom/primitives/text'
import { Clickable } from './clickable'
import { cn } from './cn'
import { Spinner } from './spinner'

export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'soft'

export type ButtonColor = 'primary' | 'danger' | 'default'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

type Combo = `${ButtonVariant}-${ButtonColor}`

export type ButtonInput = {
  fab?: boolean
  text?: TranslatedText | string
  disabled?: boolean
  type?: 'button'
  class?: string
  onPress?: (event: unknown) => void
  renderIconStart?: (input: { class?: string; fill?: string; stroke?: string }) => VDom
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  loading?: boolean
  width?: 'fit' | 'full' | 'flex-1'
  style?: Record<string, unknown>
}

export const Button = (input: ButtonInput) => {
  const colorTextClass = toClassColorText(input)
  const sizeClassPadding = toSizeClassPadding(input)
  const sizeClassText = toSizeClassText(input)
  const iconSizeClass = toIconSizeClass(input)
  const colorPressableClass = toClassColorPressable(input)
  const widthClass = toWidthClass(input)

  return h(
    Clickable,
    {
      disabled: input.disabled || input.loading,
      'data-fab': input.fab,
      class: cn(
        input.class,
        'relative flex flex-row items-center justify-center overflow-hidden rounded font-semibold',
        colorPressableClass,
        sizeClassPadding,
        widthClass,
        input.fab && 'rounded-[30px]',
        input.disabled && 'opacity-60',
        input.loading && 'opacity-70',
      ),
      role: 'button',
      'aria-label': input.text ?? '',
      onPress: input.onPress,
      style: input.style,
    },

    [
      h(
        Box,
        {
          class: cn(
            'flex flex-row h-full items-center justify-center gap-2',
            input.loading ? 'text-transparent' : null,
          ),
        },
        [
          input.renderIconStart?.({
            class: cn(colorTextClass, iconSizeClass),
            fill: 'currentColor',
            stroke: 'currentColor',
          }),
          Text({
            text: input.text ?? '',
            class: cn('overflow-hidden font-semibold', colorTextClass, sizeClassText),
          }),
        ],
      ),
      input.loading &&
        h(Box, { class: 'absolute inset-0 flex flex-row items-center justify-center' }, [
          h(Spinner, { class: 'h-8 w-8' }),
        ]),
    ],
  )
}

const toWidthClass = (input: ButtonInput): string => {
  if (!input.width) return ''
  switch (input.width) {
    case 'fit':
      return ''
    case 'full':
      return 'w-full'
    case 'flex-1':
      return 'flex-1'
  }
}

const toIconSizeClass = (input: ButtonInput): string => {
  switch (input.size ?? 'lg') {
    case 'lg':
      return 'h-8 w-8'
    case 'md':
      return 'h-6 w-6'
    case 'sm':
      return 'h-4 w-4'
    case 'xs':
      return 'h-3 w-3'
  }
}

const toSizeClassPadding = (input: ButtonInput): string => {
  switch (input.size ?? 'lg') {
    case 'lg':
      return 'h-14 px-4'
    case 'md':
      return 'h-12 px-4'
    case 'sm':
      return 'h-10 px-4'
    case 'xs':
      return 'h-8 px-3'
  }
}

const toSizeClassText = (input: ButtonInput): string => {
  switch (input.size ?? 'lg') {
    case 'lg':
      return 'text-xl'
    case 'md':
      return 'text-lg'
    case 'sm':
      return 'text-base'
    case 'xs':
      return 'text-sm'
  }
}

const toClassColorPressable = (input: ButtonInput): string => {
  const combo: Combo = `${input.variant ?? 'outlined'}-${input.color ?? 'primary'}`
  switch (combo) {
    case 'contained-primary':
      return 'bg-blue-600'
    case 'contained-danger':
      return 'bg-red-600'
    case 'contained-default':
      return 'border-2 border-blue-500/50'
    case 'text-danger':
      return ''
    case 'outlined-default':
      return 'border-2'
    case 'soft-primary':
      return 'bg-blue-500/20'
    case 'soft-danger':
      return 'bg-red-500/20'
    case 'soft-default':
      return 'bg-neutral-300/20'
    case 'text-primary':
      return ''
    case 'outlined-danger':
      return 'border-2 border-red-500/50'
    case 'outlined-primary':
      return 'border-2 border-blue-500/50'
    case 'text-default':
      return ''
  }
}

const toClassColorText = (input: ButtonInput): string => {
  const combo: Combo = `${input.variant ?? 'outlined'}-${input.color ?? 'primary'}`
  switch (combo) {
    case 'contained-primary':
      return 'text-white fill-white stroke-white'
    case 'contained-danger':
      return 'text-white fill-white stroke-white'
    case 'contained-default':
      return 'text-blue-500 fill-blue-500 stroke-blue-500'
    case 'text-danger':
      return 'font-bold text-red-500 fill-red-500 stroke-red-500'
    case 'outlined-default':
      return 'text-neutral-300 fill-neutral-300 stroke-neutral-300'
    case 'soft-primary':
      return 'text-blue-200 fill-blue-200 stroke-blue-200'
    case 'soft-danger':
      return 'text-red-200 fill-red-200 stroke-red-200'
    case 'soft-default':
      return 'text-neutral-300 fill-neutral-300 stroke-neutral-300'
    case 'text-primary':
      return 'text-blue-500 fill-blue-500 stroke-blue-500'
    case 'outlined-danger':
      return 'text-red-500 fill-red-500 stroke-red-500'
    case 'outlined-primary':
      return 'text-blue-500 fill-blue-500 stroke-blue-500'
    case 'text-default':
      return 'text-neutral-300 fill-neutral-300 stroke-neutral-300'
  }
}

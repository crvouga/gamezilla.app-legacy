import type { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { AriaRole } from '~/@/html/aria-role'
import { cn } from './cn'
import { h } from '~/@/vdom/h'
import { Text } from '../vdom/primitives/text'

export type TypographyVariant = 'title' | 'body' | 'label' | 'subtitle' | 'caption'

const sizeClassNames: { [variant in TypographyVariant]: string } = {
  title: 'text-3xl',
  body: 'text-base',
  label: 'text-xs',
  subtitle: 'text-sm',
  caption: 'text-xs',
}

export type TypographyColor = 'inherit' | 'text-primary' | 'text-secondary'

export const TEXT_SECONDARY_CLASS_NAME = 'text-neutral-300'

const colorClassNames: { [color in TypographyColor]: string } = {
  'text-secondary': TEXT_SECONDARY_CLASS_NAME,
  'text-primary': 'text-white',
  inherit: 'text-inherit',
}

type Props = {
  text: TranslatedText
  variant?: TypographyVariant
  skeleton?: boolean
  dataTestId?: string
  class?: string
  sizeClassName?: string
  role?: AriaRole
  color?: 'inherit' | 'text-primary' | 'text-secondary' | null
}

const toAriaLevel = (input: Props): number | undefined => {
  switch (input.role) {
    case 'heading': {
      switch (input.variant) {
        case 'title':
          return 1
        case 'body':
          return 2
        case 'label':
          return 3
        case 'subtitle':
          return 4
        case 'caption':
          return 5
        default:
          return undefined
      }
    }
    default: {
      return undefined
    }
  }
}

const SKELETON_CLASS = 'animate-pulse text-transparent select-none pointer-events-none bg-neutral-500 rounded'

export const Typography = (input: Props) => {
  const sizeClassName = input.sizeClassName ?? sizeClassNames[input.variant ?? 'body']
  const colorClassName = input.color && !input.skeleton ? colorClassNames[input.color] : null
  return h(
    Box,
    {
      class: cn(sizeClassName, colorClassName, input.skeleton ? SKELETON_CLASS : null, input.class),
      role: input.role,
      'aria-busy': input.skeleton,
      'aria-level': toAriaLevel(input),
      'aria-label': input.text,
      'data-title': input.variant === 'title' ? 'true' : 'false',
      'data-testid': input.dataTestId,
    },
    [Text({ text: input.text })],
  )
}

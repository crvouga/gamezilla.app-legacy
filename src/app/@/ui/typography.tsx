import type { TranslatedText } from '~/@/l18n'
import { AriaRole } from '~/@/vdom/aria-role'
import { cn } from './cn'

export type TypographyVariant = 'title' | 'body' | 'label' | 'subtitle' | 'caption'

const variantClasses: { [variant in TypographyVariant]: string } = {
  title: 'text-3xl font-bold text-white',
  body: 'text-base',
  label: 'text-xs',
  subtitle: 'text-sm',
  caption: 'text-xs',
}

export type TypographyColor = 'inherit' | 'text-primary' | 'text-secondary'

const colorClasses: { [color in TypographyColor]: string } = {
  'text-secondary': 'text-secondary',
  'text-primary': 'text-white',
  inherit: 'text-inherit',
}

type Input = {
  text: TranslatedText
  variant: TypographyVariant
  className?: string
  role?: AriaRole
  color?: 'inherit' | 'text-primary' | 'text-secondary' | null
}

const toAriaLevel = (input: Input): number | undefined => {
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
      }
    }
    default: {
      return undefined
    }
  }
}

export const Typography = (input: Input) => {
  return (
    <div
      className={cn(variantClasses[input.variant], input.color ? colorClasses[input.color] : null, input.className)}
      role={input.role}
      aria-level={toAriaLevel(input)}
      aria-label={input.text}
    >
      {input.text}
    </div>
  )
}

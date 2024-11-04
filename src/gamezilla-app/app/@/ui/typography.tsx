import type { TranslatedText } from 'gamezilla-app/@/l18n'
import { cn } from './cn'
import type { AriaRole } from 'react'

export type TypographyVariant = 'title' | 'body' | 'label' | 'subtitle' | 'caption'

const variantClasses: { [variant in TypographyVariant]: string } = {
  title: 'text-3xl font-bold text-white',
  body: 'text-base',
  label: 'text-xs',
  subtitle: 'text-sm',
  caption: 'text-xs'
}

export type TypographyColor = 'inherit' | 'text-primary' | 'text-secondary'

const colorClasses: { [color in TypographyColor]: string } = {
  'text-secondary': 'text-secondary',
  'text-primary': 'text-white',
  inherit: 'text-inherit'
}

export const Typography = (input: {
  text: TranslatedText
  variant: TypographyVariant
  className?: string
  role?: AriaRole
  color?: 'inherit' | 'text-primary' | 'text-secondary'
}) => {
  return (
    <div
      className={cn(variantClasses[input.variant], colorClasses[input.color ?? 'inherit'], input.className)}
      role={input.role}
      aria-label={input.text}
    >
      {input.text}
    </div>
  )
}

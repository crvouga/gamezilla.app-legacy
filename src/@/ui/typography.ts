import { AriaRole } from '~/@/html/aria-role'
import type { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Text } from '../vdom/primitives/text'
import { sx } from '../vdom/style/sx'

export type TypographyVariant = 'title' | 'body' | 'label' | 'subtitle' | 'caption'

const toSizeStyle = (variant: TypographyVariant) => {
  switch (variant) {
    case 'title':
      return sx({ fontSize: '3xl' })
    case 'body':
      return sx({ fontSize: 'md' })
    case 'label':
      return sx({ fontSize: 'xs' })
    case 'subtitle':
      return sx({ fontSize: 'sm' })
    case 'caption':
      return sx({ fontSize: 'xs' })
  }
}

export type TypographyColor = 'inherit' | 'text-primary' | 'text-secondary'

const toColorStyle = (color: TypographyColor) => {
  switch (color) {
    case 'text-secondary':
      return sx({ textColor: 'neutral-300' })
    case 'text-primary':
      return sx({ textColor: 'white' })
    case 'inherit':
      return sx({ textColor: 'white' })
  }
}

export type TypographyProps = {
  text: TranslatedText
  variant?: TypographyVariant
  skeleton?: boolean
  dataTestId?: string
  style?: Record<string, unknown>
  role?: AriaRole
  color?: 'inherit' | 'text-primary' | 'text-secondary' | null
  align?: 'left' | 'center' | 'right'
}

const toAriaLevel = (input: TypographyProps): number | undefined => {
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

const SKELETON_STYLE = sx({
  backgroundColor: 'neutral-500',
  pointerEvents: 'none',
})

const toTextAlignStyle = (align?: 'left' | 'center' | 'right') => {
  switch (align) {
    case 'left':
      return sx({ textAlign: 'left' })
    case 'center':
      return sx({ textAlign: 'center' })
    case 'right':
      return sx({ textAlign: 'right' })
    default:
      return sx({ textAlign: 'left' })
  }
}

export const Typography = (input: TypographyProps) => {
  const variant = input.variant ?? 'body'
  const color = input.color ?? 'text-primary'

  const style: Record<string, unknown> = {
    ...toSizeStyle(variant),
    ...(input.skeleton ? SKELETON_STYLE : toColorStyle(color)),
    ...toTextAlignStyle(input.align),
    ...input.style,
  }

  return h(Text, {
    style: style,
    role: input.role,
    'aria-busy': input.skeleton,
    'aria-level': toAriaLevel(input),
    'aria-label': input.text,
    'data-testid': input.dataTestId,
    text: input.text,
  })
}

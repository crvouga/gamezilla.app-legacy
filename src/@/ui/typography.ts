import { AriaRole } from '~/@/html/aria-role'
import type { TranslatedText } from '~/@/l18n'
import { h } from '~/@/vdom/h'
import { Text } from '../vdom/primitives/text'
import { theme } from './theme/theme'

export type TypographyVariant = 'title' | 'body' | 'label' | 'subtitle' | 'caption'

const toSizeStyle = (variant: TypographyVariant) => {
  switch (variant) {
    case 'title':
      return theme({ fontSize: '3xl' })
    case 'body':
      return theme({ fontSize: 'md' })
    case 'label':
      return theme({ fontSize: 'xs' })
    case 'subtitle':
      return theme({ fontSize: 'sm' })
    case 'caption':
      return theme({ fontSize: 'xs' })
  }
}

export type TypographyColor = 'inherit' | 'text-primary' | 'text-secondary'

const toColorStyle = (color: TypographyColor) => {
  switch (color) {
    case 'text-secondary':
      return theme({ textColor: 'neutral-300' })
    case 'text-primary':
      return theme({ textColor: 'white' })
    case 'inherit':
      return theme({ textColor: 'white' })
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

const SKELETON_STYLE = theme({
  backgroundColor: 'neutral-500',
  pointerEvents: 'none',
})

const toTextAlignStyle = (align?: 'left' | 'center' | 'right') => {
  switch (align) {
    case 'left':
      return theme({ textAlign: 'left' })
    case 'center':
      return theme({ textAlign: 'center' })
    case 'right':
      return theme({ textAlign: 'right' })
    default:
      return theme({ textAlign: 'left' })
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

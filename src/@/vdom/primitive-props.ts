import { AriaRole } from '../html/aria-role'
import { VDom } from './vdom'

export type PrimitiveProps = {
  key?: string | number | boolean | null | undefined
  children?: VDom[]
  id?: string
  role?: AriaRole
  'aria-role'?: AriaRole
  'aria-label'?: string
  'aria-level'?: number | null | undefined
  'aria-busy'?: boolean
  'aria-selected'?: boolean
  'aria-hidden'?: boolean
  'aria-disabled'?: boolean
  'aria-checked'?: boolean
  'data-testid'?: string | null | undefined
  disabled?: boolean
  tabIndex?: number | null | undefined
  style?: Record<string, unknown>
  onPress?: (event: unknown) => void
  onLayout?: (event: unknown) => void
  onPressIn?: (event: unknown) => void
  onPressOut?: (event: unknown) => void
  onStartShouldSetResponder?: (event: unknown) => boolean
  onResponderMove?: (event: unknown) => void
  onKeyDown?: (event: unknown) => void
  onPointerMove?: (event: unknown) => void
  onChangeText?: (text: string) => void
  'data-fab'?: boolean
  'data-info'?: boolean
  'data-error'?: boolean
  'data-warning'?: boolean
  'data-success'?: boolean
}

export const PrimitiveProps = {}

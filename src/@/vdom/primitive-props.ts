import { AriaRole } from '../html/aria-role'
import { Theme } from '../ui/theme/theme'
import { VDom } from './vdom'

export type PrimitiveProps = {
  key?: string | number | boolean | null | undefined
  children?: VDom[]
  id?: string
  class?: string
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
  style?: unknown
  onPress?: (event: unknown) => void
  onLayout?: (event: unknown) => void
  onPressIn?: (event: unknown) => void
  onPressOut?: (event: unknown) => void
  onStartShouldSetResponder?: (event: unknown) => boolean
  onResponderMove?: (event: unknown) => void
  onKeyDown?: (event: unknown) => void
  onPointerMove?: (event: unknown) => void
  'data-fab'?: boolean
  'data-info'?: boolean
  'data-error'?: boolean
  'data-warning'?: boolean
  'data-success'?: boolean
  //
  // [key: string]: unknown
}

const intoWebStandard = (props: PrimitiveProps) => {
  if (props.onPress) {
    ;(props as any).onClick = props.onPress
  }
  if (props.onPressIn) {
    ;(props as any).onPointerDown = props.onPressIn
  }
  if (props.onPressOut) {
    ;(props as any).onPointerUp = props.onPressOut
    ;(props as any).onPointerCancel = props.onPressOut
  }
  if (props.style) {
    Theme.normalizeToWebStandard(props.style as Record<string, string | number | null>)
  }
  return props
}

const intoReactNativeStandard = (props: PrimitiveProps) => {
  if (props.style) {
    Theme.normalizeToReactNativeStandard(props.style as Record<string, string | number | null>)
  }
  return props
}

export const PrimitiveProps = {
  intoWebStandard,
  intoReactNativeStandard,
}

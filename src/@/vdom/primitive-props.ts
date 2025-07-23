import { AriaRole } from '../html/aria-role'
import { VDom } from './vdom'

export type PrimitiveProps = {
  key?: string | number | boolean | null | undefined
  children?: VDom[]
  id?: string
  class?: string
  role?: AriaRole
  'aria-role'?: AriaRole
  'aria-label'?: string
  'aria-selected'?: boolean
  'aria-hidden'?: boolean
  'aria-disabled'?: boolean
  'aria-checked'?: boolean
  'data-testid'?: string
  disabled?: boolean
  tabIndex?: number | null | undefined
  style?: unknown
  onPress?: (event: unknown) => void
  onPressUp?: (event: unknown) => void
  onKeyDown?: (event: unknown) => void
  'data-fab'?: boolean
  'data-info'?: boolean
  'data-error'?: boolean
  'data-warning'?: boolean
  'data-success'?: boolean
  //
  [key: string]: unknown
}

const intoWebStandard = (props: PrimitiveProps) => {
  return {
    ...props,
    onClick: props.onPress,
    onPointerUp: props.onPressUp,
    onKeyDown: props.onKeyDown,
  }
}

const intoReactNativeStandard = (props: PrimitiveProps) => {
  return {
    ...props,
    onPress: props.onPress,
    onPressUp: props.onPressUp,
  }
}

export const PrimitiveProps = {
  intoWebStandard,
  intoReactNativeStandard,
}

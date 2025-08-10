import { hasPixelUnit } from '~/@/css/has-pixel-unit'
import { isObject } from '~/@/object/is-object'

export const mapPropsToWebProps = (props: Record<string, unknown>) => {
  const propsNew = { ...props }
  inPlaceMapPropsToWebProps(propsNew)
  return propsNew
}

export const inPlaceMapPropsToWebProps = (props: Record<string, unknown>) => {
  if (props.onPress) {
    props.onClick = props.onPress
  }
  if (props.onPressIn) {
    props.onPointerDown = props.onPressIn
  }
  if (props.onPressOut) {
    props.onPointerUp = props.onPressOut
    props.onPointerCancel = props.onPressOut
  }
  const onChangeText = props.onChangeText
  if (typeof onChangeText === 'function') {
    props.onInput = (e: unknown) => {
      let value = ''
      if (value.length === 0) value = unknownToCurrentTargetValue(e) ?? ''
      if (value.length === 0) value = unknownToData(e) ?? ''
      onChangeText?.(value)
    }
  }

  if (isObject(props.style)) {
    inPlaceMapStyles(props.style)
  }
}

const inPlaceMapStyles = (styles: Record<string, unknown>): void => {
  for (const key in styles) {
    if (styles[key] === null || styles[key] === undefined) {
      delete styles[key]
    } else if (typeof styles[key] === 'number' && hasPixelUnit(key)) {
      styles[key] = `${styles[key]}px`
    }
  }
}

const unknownToData = (e: unknown): string | null => {
  if (typeof e === 'object' && e !== null && 'data' in e && typeof e.data === 'string') {
    return e.data.trim()
  }
  return null
}

const unknownToCurrentTargetValue = (e: unknown): string | null => {
  if (
    e instanceof Event &&
    'currentTarget' in e &&
    typeof e.currentTarget === 'object' &&
    e.currentTarget !== null &&
    'value' in e.currentTarget &&
    typeof e.currentTarget.value === 'string'
  ) {
    return e.currentTarget.value.trim()
  }
  return null
}

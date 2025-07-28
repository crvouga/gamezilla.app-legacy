import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { TEXT_INPUT_TAG } from '../tags'

export type TextInputProps = PrimitiveProps & {
  defaultValue?: string | number | null | undefined
  onChangeText?: (text: string) => void
  placeholder?: string | null | undefined
  type?:
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'search'
    | 'tel'
    | 'url'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'month'
    | 'week'
}

export const TextInput = (props: TextInputProps) => {
  return h(TEXT_INPUT_TAG, props, [])
}

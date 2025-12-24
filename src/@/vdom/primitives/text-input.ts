import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { TEXT_INPUT_TAG } from '../tags'
import { UserSelect } from '../style/user-select'

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

const BASE_STYLE = {
  backgroundColor: 'rgba(0, 0, 0, 0)',
  border: '0px solid black',
  boxSizing: 'border-box',
  color: 'rgb(0, 0, 0)',
  display: 'inline',
  font: '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  position: 'relative',
  textAlign: 'start',
  textDecoration: 'none',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  userSelect: UserSelect.of('none'),
  outline: 'none',
  boxShadow: 'none',
  appearance: 'none',
}

export const TextInput = (props: TextInputProps) => {
  return h(TEXT_INPUT_TAG, { ...props, style: { ...BASE_STYLE, ...props.style } }, [])
}

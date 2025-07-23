import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { TEXT_INPUT_TAG } from '../tags'

export type TextInputProps = PrimitiveProps & {
  defaultValue?: string
  onChangeText: (text: string) => void
}

export const TextInput = (props: TextInputProps) => {
  return h(TEXT_INPUT_TAG, props, [])
}

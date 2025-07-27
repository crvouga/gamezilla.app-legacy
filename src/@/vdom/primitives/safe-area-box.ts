import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { SAFE_AREA_BOX_TAG } from '../tags'

export type SafeAreaBoxProps = PrimitiveProps

export const SafeAreaBox = ({ children, ...props }: SafeAreaBoxProps) => {
  return h(SAFE_AREA_BOX_TAG, props, children)
}

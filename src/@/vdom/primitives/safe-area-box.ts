import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { SAFE_AREA_BOX_TAG } from '../tags'

export type SafeAreaBoxEdge = 'top' | 'bottom' | 'left' | 'right'

export const ALL_SAFE_AREA_BOX_EDGES: SafeAreaBoxEdge[] = ['top', 'bottom', 'left', 'right']

export type SafeAreaBoxProps = PrimitiveProps & {
  edges: SafeAreaBoxEdge[]
}

export const SafeAreaBox = ({ children, ...props }: SafeAreaBoxProps) => {
  return h(SAFE_AREA_BOX_TAG, props, children)
}

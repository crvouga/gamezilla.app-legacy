import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { SAFE_AREA_BOX_TAG } from '../tags'
import { VDom } from '../vdom'

export type SafeAreaBoxEdge = 'top' | 'bottom' | 'left' | 'right'

export const ALL_SAFE_AREA_BOX_EDGES: SafeAreaBoxEdge[] = ['top', 'bottom', 'left', 'right']

export type SafeAreaBoxProps = PrimitiveProps & {
  edges: SafeAreaBoxEdge[]
}

export let SafeAreaBox: (props: SafeAreaBoxProps) => VDom

SafeAreaBox = ({ children, ...props }: SafeAreaBoxProps) => {
  return h(SAFE_AREA_BOX_TAG, props, children)
}

export const setSafeAreaBox = (impl: (props: SafeAreaBoxProps) => VDom) => {
  SafeAreaBox = impl
}
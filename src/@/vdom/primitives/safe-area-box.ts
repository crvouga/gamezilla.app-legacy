import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { SAFE_AREA_BOX_TAG } from '../tags'

export type SafeAreaBoxEdge = 'top' | 'bottom' | 'left' | 'right'

export const ALL_SAFE_AREA_BOX_EDGES: SafeAreaBoxEdge[] = ['top', 'bottom', 'left', 'right']

export type SafeAreaBoxProps = PrimitiveProps & {
  edges: SafeAreaBoxEdge[]
}

const BASE_STYLE = {
  alignContent: 'flex-start',
  alignItems: 'stretch',
  backgroundColor: 'rgba(0, 0, 0, 0)',
  border: '0px solid black',
  boxSizing: 'border-box',
  display: 'flex',
  flexBasis: 'auto',
  flexDirection: 'column',
  flexShrink: 0,
  listStyle: 'none',
  margin: 0,
  minHeight: 0,
  minWidth: 0,
  padding: 0,
  position: 'relative',
  textDecoration: 'none',
  zIndex: 0,
}

export const SafeAreaBox = ({ children, ...props }: SafeAreaBoxProps) => {
  return h(SAFE_AREA_BOX_TAG, { ...props, style: { ...BASE_STYLE, ...props.style } }, children)
}

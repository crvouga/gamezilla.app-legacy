import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { SCROLL_BOX_TAG } from '../tags'
import { VDom } from '../vdom'

export type ScrollBoxProps = PrimitiveProps & {
  children?: VDom[]
  contentContainerStyle?: {
    rowGap?: number
    columnGap?: number
  }
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

export const ScrollBox = ({ children, ...props }: ScrollBoxProps) => {
  return h(SCROLL_BOX_TAG, { ...props, style: { ...BASE_STYLE, ...props.style } }, children)
}

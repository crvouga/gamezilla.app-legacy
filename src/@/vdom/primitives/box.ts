import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { BOX_TAG } from '../tags'
import { VDom } from '../vdom'

export type BoxProps = PrimitiveProps & {
  children?: VDom[]
}

const BOX_STYLE_BASE = {
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

export const Box = ({ children, ...props }: BoxProps) => {
  return h(BOX_TAG, { ...props, style: { ...BOX_STYLE_BASE, ...props.style } }, children)
}

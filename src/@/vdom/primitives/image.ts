import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { IMAGE_TAG } from '../tags'
import { UserSelect } from '../style/user-select'

export type ImageProps = PrimitiveProps & {
  src: string
  alt: string
  children?: VDom[]
}

const BASE_STYLE = {
  backgroundColor: 'rgba(0, 0, 0, 0)',
  border: '0px solid black',
  boxSizing: 'border-box',
  color: 'rgb(0, 0, 0)',
  display: 'inline',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  position: 'relative',
  textAlign: 'start',
  textDecoration: 'none',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  userSelect: UserSelect.of('none'),
}

export const Image = ({ children, ...props }: ImageProps) => {
  return h(IMAGE_TAG, { ...props, style: { ...BASE_STYLE, ...props.style } }, children)
}

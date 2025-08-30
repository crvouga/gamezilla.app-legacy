import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { PRESSABLE_TAG } from '../tags'
import { UserSelect } from '../style/user-select'

export type PressableProps = PrimitiveProps & {
  children: VDom[]
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
  userSelect: UserSelect.of('none'),
}

export const Pressable = ({ children, ...props }: PressableProps) => {
  return h(PRESSABLE_TAG, { ...props, style: { ...BASE_STYLE, ...props.style } }, children)
}

import { h } from '~/@/vdom/vdom-engine/impl'
import { PrimitiveProps } from '../primitive-props'
import { UserSelect } from '../style/user-select'
import { TEXT_TAG } from '../tags'
import { VDom } from '../vdom'

export type TextProps = PrimitiveProps & {
  text: string
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
}

export const Text = ({ text, ...props }: TextProps): VDom => {
  return h(TEXT_TAG, { ...props, style: { ...BASE_STYLE, ...props.style } }, [text as unknown as VDom])
}

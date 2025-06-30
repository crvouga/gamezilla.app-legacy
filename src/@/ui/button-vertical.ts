import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { Button } from './button'

export const ButtonVertical = (props: { children: VDom }) => {
  return h(Button, { className: 'flex-col gap-2' }, props.children)
}

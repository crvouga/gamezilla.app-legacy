import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { Button } from './button'

export const ButtonVertical = (props: { children: VDom }) => {
  return h(Button, { class: 'flex-col gap-2', width: 'full' }, [props.children])
}

import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'
import { Button } from './button'

export const ButtonVertical = (props: { children: VDom }) => {
  return v(Button, { class: 'flex-col gap-2' }, [props.children])
}

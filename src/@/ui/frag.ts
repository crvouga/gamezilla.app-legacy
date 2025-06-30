import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const Frag = (props: { children: VDom }) => {
  return h('fragment', null, props.children)
}

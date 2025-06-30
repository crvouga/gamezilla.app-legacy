import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const Frag = (props: { key?: unknown; children?: VDom }) => {
  return h('fragment', { key: props.key }, [props.children])
}

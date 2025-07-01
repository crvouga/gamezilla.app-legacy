import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { VDOM_FRAGMENT_KEY } from '../vdom/fragment'

export const Frag = (props: { key?: unknown; children?: VDom }) => {
  return h(VDOM_FRAGMENT_KEY, { key: props.key }, [props.children])
}

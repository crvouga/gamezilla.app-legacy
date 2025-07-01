import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'
import { VDOM_FRAGMENT_KEY } from '../vdom/fragment'

export const Frag = (props: { key?: unknown; children?: VDom }) => {
  return v(VDOM_FRAGMENT_KEY, { key: props.key }, [props.children])
}

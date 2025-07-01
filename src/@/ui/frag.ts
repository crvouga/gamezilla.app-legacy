import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'

export const Frag = (props: { key?: unknown; children?: VDom }) => {
  return v('fragment', { key: props.key }, [props.children])
}

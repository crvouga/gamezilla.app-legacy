import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/vdom-engine/impl'
import { FRAGMENT_TAG } from '../tags'

export const Frag = (props: { children?: VDom[] }) => {
  return h(FRAGMENT_TAG, {}, props.children)
}

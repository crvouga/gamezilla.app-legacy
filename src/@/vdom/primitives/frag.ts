import type { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/vdom-engine/impl'
import { FRAGMENT_TAG } from '../tags'

export const Frag = (input: { children?: VDom[] }) => {
  return h(FRAGMENT_TAG, {}, input.children)
}

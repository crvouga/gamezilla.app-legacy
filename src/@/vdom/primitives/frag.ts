import { h, tag } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const FRAGMENT_TAG = tag('@frag')

export const Frag = (props: { children?: VDom[] }) => {
  return h(FRAGMENT_TAG, {}, props.children)
}

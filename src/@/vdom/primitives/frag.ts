import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { VDOM_FRAGMENT_KEY } from '../fragment'

export const Frag = (props: { children?: VDom[] }) => {
  return h(
    // @ts-ignore
    VDOM_FRAGMENT_KEY,
    {},
    props.children,
  )
}

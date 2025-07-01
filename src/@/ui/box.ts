import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

export const Box = (input: { children: VDom; class?: string }) => {
  return h('div', { class: input.class }, [input.children])
}

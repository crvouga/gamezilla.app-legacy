import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'

export const Box = (input: { children: VDom; class?: string }) => {
  return v('div', { class: input.class }, [input.children])
}

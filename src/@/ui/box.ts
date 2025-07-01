import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'

export const Box = (input: { children: VDom; className?: string }) => {
  return v('div', { className: input.className }, [input.children])
}

import { VDom } from '~/@/vdom/vdom'
import { v } from '~/@/vdom/v'

export const SurfaceBody = (input: { children: VDom }) => {
  return v('div', { class: 'px-6 py-3 text-left' }, [input.children])
}

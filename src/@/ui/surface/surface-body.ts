import { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/h'

export const SurfaceBody = (input: { children: VDom }) => {
  return h('div', { className: 'px-6 py-3 text-left' }, [input.children])
}

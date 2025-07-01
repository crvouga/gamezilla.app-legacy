import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'

export const BoardLayout = (props: { children: VDom[] }) => {
  return h('div', { class: 'flex w-full flex-1 flex-col items-center justify-center overflow-y-auto' }, props.children)
}

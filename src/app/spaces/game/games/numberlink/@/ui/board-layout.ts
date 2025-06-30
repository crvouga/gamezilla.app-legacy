import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'

export const BoardLayout = (input: { children: VDom }) => {
  return h('div', { className: 'flex w-full flex-1 flex-col items-center justify-center overflow-y-auto' }, [
    input.children,
  ])
}

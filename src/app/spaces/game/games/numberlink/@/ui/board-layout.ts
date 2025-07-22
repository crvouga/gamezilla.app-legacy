import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/box'
import { VDom } from '~/@/vdom/vdom'

export const BoardLayout = (props: { children: VDom[] }) => {
  return h(Box, { class: 'flex w-full flex-1 flex-col items-center justify-center overflow-y-auto' }, props.children)
}

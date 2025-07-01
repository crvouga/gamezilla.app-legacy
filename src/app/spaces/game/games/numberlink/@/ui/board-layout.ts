import { v } from '~/@/vdom/v'
import { VDom } from '~/@/vdom/vdom'

export const BoardLayout = (input: { children: VDom }) => {
  return v('div', { class: 'flex w-full flex-1 flex-col items-center justify-center overflow-y-auto' }, [
    input.children,
  ])
}

import { VDom } from '~/@/vdom/vdom'
import { v } from '~/@/vdom/v'

export const SurfaceActions = (input: { children: VDom }) => {
  return v('div', { class: 'flex w-full items-center gap-6 p-6 pt-6' }, [input.children])
}

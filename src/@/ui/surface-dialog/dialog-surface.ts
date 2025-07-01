import type { VDom } from '~/@/vdom/vdom'
import { v } from '~/@/vdom/v'
import { Surface } from '../surface'

export const DialogSurface = (input: { children: VDom }) => {
  return v(
    Surface,
    { class: 'relative z-50 flex w-full max-w-[400px] flex-col rounded-lg shadow-2xl drop-shadow-2xl' },
    [input.children],
  )
}

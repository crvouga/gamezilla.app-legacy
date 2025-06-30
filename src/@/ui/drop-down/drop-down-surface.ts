import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { cn } from '../cn'
import { Surface } from '../surface'

export const DropDownSurface = (input: { children: VDom }) => {
  return h(
    Surface,
    {
      className: cn(
        'relative z-50 flex w-screen max-w-[400px] flex-col rounded-lg shadow-2xl drop-shadow-2xl',
        'opacity-100 transition-opacity duration-300 ease-in-out',
      ),
    },
    [input.children],
  )
}

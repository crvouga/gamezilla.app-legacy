import { v } from '~/@/vdom/v'
import { VDom } from '~/@/vdom/vdom'

export const ViewAppRoot = (input: { children: VDom }) => {
  return v(
    'div',
    {
      className:
        'relative flex h-[100dvh] w-[100dvw] flex-col items-center justify-center overflow-hidden bg-black text-white',
      style: {
        padding:
          'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
      },
    },
    [input.children],
  )
}

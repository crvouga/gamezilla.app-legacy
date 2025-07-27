import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'

export const AppRoot = (input: { children: VDom[] }) => {
  return h(
    Box,
    {
      class:
        'relative flex h-[100dvh] w-[100dvw] flex-col items-center justify-center overflow-hidden bg-black text-white',
    },
    input.children,
  )
}

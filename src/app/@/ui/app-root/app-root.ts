import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { SafeAreaBox } from '~/@/vdom/primitives/safe-area-box'
import { VDom } from '~/@/vdom/vdom'

export const AppRoot = (input: { children: VDom[] }) => {
  return h(
    Box,
    { class: 'flex flex-col items-center justify-center overflow-hidden bg-black text-white flex-1 w-screen h-screen' },
    [h(SafeAreaBox, { class: 'flex flex-col flex-1 w-full' }, input.children)],
  )
}

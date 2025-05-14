import type { VDom } from '~/@/vdom/vdom'
import { Surface } from '../surface'

export const DialogSurface = (input: { children: VDom }) => {
  return (
    <Surface className='relative z-50 flex w-full max-w-[400px] flex-col rounded-lg border shadow-2xl drop-shadow-2xl'>
      {input.children}
    </Surface>
  )
}

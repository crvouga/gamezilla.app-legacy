import { VDom } from '~/@/vdom/vdom'

export const SurfaceActions = (input: { children: VDom }) => {
  return <div className='flex w-full items-center gap-6 p-6 pt-6'>{input.children}</div>
}

import { VDom } from '~/@/vdom/vdom'

export const SurfaceBody = (input: { children: VDom }) => {
  return <div className='px-6 py-3 text-left'>{input.children}</div>
}

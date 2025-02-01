import type { VDom } from '~/@/vdom/vdom'

export const DialogBody = (input: { children: VDom }) => {
  return <div className='flex w-full flex-col items-center justify-center px-6 pb-4 pt-2'>{input.children}</div>
}

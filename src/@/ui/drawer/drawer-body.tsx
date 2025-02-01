import type { VDom } from '~/@/vdom/vdom'

export const DrawerBody = (input: { children?: VDom }) => {
  return <div className='flex w-full flex-1 flex-col'>{input.children}</div>
}

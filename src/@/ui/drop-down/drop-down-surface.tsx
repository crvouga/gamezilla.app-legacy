import type { VDom } from '~/@/vdom/vdom'

export const DropDownSurface = (input: { children: VDom }) => {
  return (
    <div className='bg-surface border-surface relative z-50 flex w-screen max-w-[400px] flex-col rounded-lg border shadow-2xl drop-shadow-2xl'>
      {input.children}
    </div>
  )
}

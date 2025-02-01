import type { VDom } from '~/@/vdom/vdom'

export const DialogSurface = (input: { children: VDom }) => {
  return (
    <div className='bg-surface border-surface relative z-50 flex w-full max-w-[400px] scale-0 flex-col rounded-lg border shadow-2xl drop-shadow-2xl transition-transform duration-300 ease-in-out [.opacity-100_&]:scale-100'>
      {input.children}
    </div>
  )
}

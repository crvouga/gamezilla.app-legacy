import { VDomChildren } from '~/@/vdom/vdom'

export const ViewAppRoot = (input: { children: VDomChildren }) => {
  return (
    <div className='relative flex h-[100dvh] w-[100dvw] flex-col items-center justify-center overflow-hidden bg-black text-white'>
      {input.children}
    </div>
  )
}

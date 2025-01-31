import { VDom } from '~/@/vdom/vdom'

export const ViewAppRoot = (input: { children: VDom }) => {
  return (
    <div className='relative mx-auto flex h-[100dvh] w-[100dvw] max-w-[1600px] flex-col items-center justify-center overflow-hidden bg-black text-white'>
      {input.children}
    </div>
  )
}

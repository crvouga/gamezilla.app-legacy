import { cn } from '~/@/ui'
import { VDomChildren } from '~/@/vdom/vdom'

// const BOX_CLASS_NAME = 'max-h-[920px] max-w-[1500px] rounded border'
// const BOX_CLASS_NAME = ' max-w-[1600px]'
const BOX_CLASS_NAME = ''
export const ViewAppRoot = (input: { children: VDomChildren }) => {
  return (
    <div className='fixed left-1/2 top-1/2 flex h-[100dvh] w-screen -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden bg-neutral-950 text-white'>
      <div
        className={cn(
          'relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-black text-white',
          BOX_CLASS_NAME,
        )}
      >
        {input.children}
      </div>
    </div>
  )
}

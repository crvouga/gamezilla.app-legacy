import { VDomChildren } from '~/@/vdom/vdom'

export const FlowLayout = (input: { top: VDomChildren; middle: VDomChildren; bottom: VDomChildren }) => {
  return (
    <div className='flex w-full flex-1 flex-col items-center justify-center overflow-y-auto'>
      <div className='flex flex-1 flex-col justify-end'>{input.top}</div>

      {input.middle}

      <div className='flex w-full flex-1 flex-col justify-end'>{input.bottom}</div>
    </div>
  )
}

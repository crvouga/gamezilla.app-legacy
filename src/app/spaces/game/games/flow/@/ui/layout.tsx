import { VDom } from '~/@/vdom/vdom'

export const BoardLayout = (input: { top: VDom; board: VDom; bottom: VDom }) => {
  return (
    <div className='flex max-h-full w-full flex-1 flex-col items-center justify-center overflow-hidden'>
      <div className='flex flex-1 shrink-0 flex-col justify-end'>{input.top}</div>

      <div className='w-full grow-0 overflow-hidden'>{input.board}</div>

      <div className='flex w-full flex-1 shrink-0 flex-col justify-end'>{input.bottom}</div>
    </div>
  )
}

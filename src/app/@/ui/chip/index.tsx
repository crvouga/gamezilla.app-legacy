import { VDomChildren } from '~/@/vdom'

export const Chip = (input: { children: VDomChildren }) => {
  return (
    <div className='flex items-center gap-1 rounded-xl border border-paper bg-paper px-2 py-1 text-xs font-semibold'>
      {input.children}
    </div>
  )
}

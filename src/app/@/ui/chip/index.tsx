import { VDomChildren } from '~/@/vdom/vdom'

export const Chip = (input: { children: VDomChildren }) => {
  return (
    <div className='border-paper bg-paper flex items-center gap-1 rounded-xl border px-2 py-1 text-xs font-semibold'>
      {input.children}
    </div>
  )
}

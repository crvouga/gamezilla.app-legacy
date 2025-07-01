import type { VDom } from '~/@/vdom/vdom'
import { v } from '~/@/vdom/v'
import { cn } from '../cn'
import { styles } from '~/@/vdom/style'
import { TimeSpan } from '~/@/time/time-span'

export const Dialog = (input: { children?: VDom; open: boolean; onClose: () => void; delay?: TimeSpan }) => {
  const delayMs = input.delay ? TimeSpan.toMilliseconds(input.delay) : null
  const style = styles({
    'transition-delay': input.open && delayMs ? `${delayMs}ms` : undefined,
  })
  return v(
    'div',
    {
      role: 'dialog',
      style: style,
      className: cn(
        'fixed top-0 left-0 z-50 grid h-full w-full place-items-center bg-black/50 transition-opacity duration-300 ease-in-out',
        input.open ? 'opacity-100' : 'pointer-events-none opacity-0',
      ),
      onClick: (e: { target: any; currentTarget: any }) => {
        if (e.target === e.currentTarget) {
          input.onClose()
          return
        }
      },
      onKeyDown: (e: { key: string }) => {
        if (e.key === 'Escape') {
          input.onClose()
          return
        }
      },
    },
    [input.children],
  )
}

import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { cn } from '../cn'

export const Dialog = (input: {
  children?: VDom[]
  open: boolean
  onClose: () => void
  delay?: '300ms'
  testId?: string
}) => {
  return h(
    Box,
    {
      role: 'dialog',
      class: cn(
        'fixed top-0 left-0 z-50 grid h-full w-full place-items-center bg-black/50 transition-opacity duration-300 ease-in-out',
        input.open ? 'opacity-100' : 'pointer-events-none opacity-0',
        input.open ? (input.delay === '300ms' ? 'delay-300' : '') : '',
      ),
      'data-open': input.open ? 'true' : 'false',
      'aria-hidden': input.open ? 'false' : 'true',
      'data-testid': input.testId,
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
    input.children,
  )
}

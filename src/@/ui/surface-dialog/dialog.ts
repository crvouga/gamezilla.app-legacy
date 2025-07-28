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
        'absolute top-0 left-0 z-50 grid h-full w-full place-items-center bg-black/50 transition-opacity duration-300 ease-in-out',
        input.open ? 'opacity-100' : 'pointer-events-none opacity-0',
        input.open ? (input.delay === '300ms' ? 'delay-300' : '') : '',
      ),
      'aria-hidden': input.open,
      'data-testid': input.testId,
      onPress: (e: unknown) => {
        if (
          typeof e === 'object' &&
          e !== null &&
          'target' in e &&
          'currentTarget' in e &&
          e.target === e.currentTarget
        ) {
          input.onClose()
          return
        }
      },
      onKeyDown: (e: unknown) => {
        if (typeof e !== 'object' || e === null) {
          return
        }
        if ('key' in e) {
          if (e.key === 'Escape') {
            input.onClose()
            return
          }
        }
      },
    },
    input.children,
  )
}

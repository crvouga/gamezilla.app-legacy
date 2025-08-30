import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { sx } from '../../vdom/style/sx'
import { Portal } from '~/@/vdom/primitives/portal'

export const Dialog = (input: {
  children?: VDom[]
  open: boolean
  onClose: () => void
  delay?: '300ms'
  testId?: string
}) => {
  return h(Portal.Entrance, {}, [
    h(
      Box,
      {
        role: 'dialog',
        style: sx({
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 50,
          height: 'full',
          width: 'full',
          backgroundColor: 'black/50',
          opacity: input.open ? 1 : 0,
          pointerEvents: input.open ? 'auto' : 'none',
          // transitionDelay: input.open && input.delay === '300ms' ? '300ms' : undefined,
        }),
        'aria-hidden': !input.open,
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
    ),
  ])
}

import { h } from '~/@/vdom/h'
import { cn } from '../../cn'
import { Gutter } from '../../gutter'
import { Portal } from '../../portal'
import { Surface } from '../../surface'
import { DRAWER_PORTAL_ID } from '../drawer-portal-exit'
import type { DrawerProps } from '../drawer-shared'
import './drawer-element'
import { drawerSub } from './drawer-shared'

export const DrawerWebComponent = (input: DrawerProps) => {
  drawerSub.pub({ type: 'input', ...input })
  return h(Portal.Entrance, { portalId: DRAWER_PORTAL_ID }, [
    h('drawer-element', { id: input.id, position: input.position }, [
      h(
        Surface,
        {
          // 'aria-hidden': !input.open,
          role: 'dialog',
          'aria-label': input.ariaLabel,
          class: cn(
            'h-fit max-h-full w-full overflow-hidden border',
            input.position === 'bottom' ? 'rounded-t-2xl' : 'rounded-b-2xl',
          ),
        },
        [
          input.position === 'top' && h(Gutter, { variant: 'drawer' }),
          input.children,
          input.position === 'bottom' && h(Gutter, { variant: 'drawer' }),
        ],
      ),
    ]),
  ])
}

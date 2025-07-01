import { v } from '~/@/vdom/v'
import { cn } from '../../cn'
import { Gutter } from '../../gutter'
import { Portal } from '../../portal'
import { Surface } from '../../surface'
import { DRAWER_PORTAL_ID } from '../drawer-portal-exit'
import type { DrawerInput } from '../drawer-shared'
import './drawer-element'
import { drawerSub } from './drawer-shared'
import { Frag } from '../../frag'

export const DrawerWebComponent = (input: DrawerInput) => {
  drawerSub.pub({ type: 'input', ...input })
  return v(Portal.Entrance, {
    portalId: DRAWER_PORTAL_ID,
    children: v(Frag, null, [
      v('drawer-element', {
        id: input.id,
        position: input.position,
        children: v(Frag, null, [
          v(Surface, {
            'aria-hidden': !input.open,
            role: 'dialog',
            'aria-label': input.ariaLabel,
            class: cn(
              'h-fit max-h-full w-full overflow-hidden border',
              input.position === 'bottom' ? 'rounded-t-2xl' : 'rounded-b-2xl',
            ),
            children: v(Frag, null, [
              input.position === 'top' && v(Gutter, { variant: 'drawer' }),
              input.children,
              input.position === 'bottom' && v(Gutter, { variant: 'drawer' }),
            ]),
          }),
        ]),
      }),
    ]),
  })
}

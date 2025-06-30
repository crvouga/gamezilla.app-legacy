import { cn } from '~/@/ui/cn'
import { Gutter } from '~/@/ui/gutter'
import { Portal } from '../portal'
import { DRAWER_PORTAL_ID } from './drawer-portal-exit'
import type { DrawerInput } from './drawer-shared'
import { preventConsoleErrorWhenClosingDrawer } from './drawer-shared'
import { Surface } from '../surface'
import { h } from '~/@/vdom/h'
import { Frag } from '../frag'

export const DrawerComponent = (props: DrawerInput) => {
  return h(Portal.Entrance, {
    portalId: DRAWER_PORTAL_ID,
    children: h(
      Frag,
      null,
      h(
        'div',
        {
          id: props.id,
          'aria-hidden': !props.open,
          role: 'dialog',
          'aria-label': props.ariaLabel,
          className: cn(
            'absolute inset-0 z-50 flex bg-black/80 transition-opacity duration-200',
            props.position === 'bottom' ? 'flex-col' : 'flex-col-reverse',
            props.open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          ),
        },
        [
          h('div', {
            className: 'w-full flex-1',
            'aria-label': props.ctx.t('drawer.close'),
            onClick: (event: unknown) => {
              preventConsoleErrorWhenClosingDrawer(event)
              props.onClose()
            },
          }),

          h(
            Surface,
            {
              className: cn(
                'h-fit w-full transition-transform duration-200',
                props.position === 'bottom'
                  ? `rounded-t-2xl ${props.open ? 'translate-y-0' : 'translate-y-full'}`
                  : `rounded-b-2xl ${props.open ? 'translate-y-0' : '-translate-y-full'}`,
              ),
            },
            props.position === 'top' && h(Gutter, { variant: 'drawer' }),
            props.children,
            props.position === 'bottom' && h(Gutter, { variant: 'drawer' }),
          ),
        ],
      ),
    ),
  })
}

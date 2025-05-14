import { cn } from '../../cn'
import { Gutter } from '../../gutter'
import { Portal } from '../../portal'
import { Surface } from '../../surface'
import { DRAWER_PORTAL_ID } from '../drawer-portal-exit'
import type { DrawerInput } from '../drawer-shared'
import './drawer-element'
import { drawerSub } from './drawer-shared'

export const DrawerWebComponent = (input: DrawerInput) => {
  drawerSub.pub({ type: 'input', ...input })
  return (
    <Portal.Entrance portalId={DRAWER_PORTAL_ID}>
      {/* @ts-ignore */}
      <drawer-element id={input.id} position={input.position}>
        <Surface
          aria-hidden={!input.open}
          role='dialog'
          aria-label={input.ariaLabel}
          className={cn(
            'h-fit max-h-full w-full overflow-hidden border',
            input.position === 'bottom' ? 'rounded-t-2xl' : 'rounded-b-2xl',
          )}
        >
          {input.position === 'top' && <Gutter variant='drawer' />}
          {input.children}
          {input.position === 'bottom' && <Gutter variant='drawer' />}
        </Surface>
        {/* @ts-ignore */}
      </drawer-element>
    </Portal.Entrance>
  )
}

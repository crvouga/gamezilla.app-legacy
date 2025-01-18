import { cn } from '../../cn'
import { Gutter } from '../../gutter'
import { Portal } from '../../portal'
import type { DrawerInput } from '../drawer-shared'
import './drawer-element'
import { drawerSub } from './drawer-shared'

export const DrawerWebComponent = (input: DrawerInput) => {
  drawerSub.pub({ type: 'input', ...input })
  return (
    <Portal.Entrance portalId='app-root'>
      {/* @ts-ignore */}
      <drawer-element id={input.id} position={input.position}>
        <div
          className={cn(
            'bg-surface h-fit max-h-full w-full overflow-hidden border',
            input.position === 'bottom' ? 'rounded-t-2xl' : 'rounded-b-2xl',
          )}
        >
          {input.position === 'top' && <Gutter variant='drawer' />}
          {input.children}
          {input.position === 'bottom' && <Gutter variant='drawer' />}
        </div>
        {/* @ts-ignore */}
      </drawer-element>
    </Portal.Entrance>
  )
}

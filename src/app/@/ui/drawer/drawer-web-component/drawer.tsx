import { Portal } from '../../portal'
import { cn } from '../../cn'
import type { DrawerInput } from '../drawer-shared'
import './drawer-element'
import { drawerSub } from './drawer-shared'

export const DrawerWebComponent = (input: DrawerInput) => {
  drawerSub.pub({ type: 'input', ...input })
  return (
    <Portal.Entrance portalId='modals'>
      {/* @ts-ignore */}
      <drawer-element id={input.id} position={input.position}>
        <div
          className={cn(
            'h-fit max-h-full w-full overflow-hidden border  bg-black',
            input.position === 'bottom' ? 'rounded-t-2xl' : 'rounded-b-2xl'
          )}
        >
          {input.children}
        </div>
        {/* @ts-ignore */}
      </drawer-element>
    </Portal.Entrance>
  )
}

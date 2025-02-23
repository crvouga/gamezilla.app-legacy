import { cn } from '~/@/ui/cn'
import { Gutter } from '~/@/ui/gutter'
import type { DrawerInput } from './drawer-shared'
import { preventConsoleErrorWhenClosingDrawer } from './drawer-shared'
import { Portal } from '../portal'

export const DrawerComponent = (props: DrawerInput) => {
  return (
    <Portal.Entrance portalId='app-root'>
      <div
        id={props.id}
        aria-hidden={!props.open}
        role='dialog'
        aria-label={props.ariaLabel}
        className={cn(
          'absolute inset-0 z-50 flex',
          props.position === 'bottom' ? 'flex-col' : 'flex-col-reverse',
          props.open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          className={cn(
            'flex-1 bg-black/80 transition-opacity duration-200',
            props.open ? 'opacity-100' : 'opacity-0',
            !props.open && 'pointer-events-none',
          )}
          aria-label={props.ctx.t('drawer.close')}
          onClick={(event) => {
            preventConsoleErrorWhenClosingDrawer(event)
            props.onClose()
          }}
        />

        <div
          className={cn(
            'bg-surface h-fit w-full border transition-transform duration-200',
            props.position === 'bottom'
              ? `rounded-t-2xl ${props.open ? 'translate-y-0' : 'translate-y-full'}`
              : `rounded-b-2xl ${props.open ? 'translate-y-0' : '-translate-y-full'}`,
          )}
        >
          {props.position === 'top' && <Gutter variant='drawer' />}
          {props.children}
          {props.position === 'bottom' && <Gutter variant='drawer' />}
        </div>
      </div>
    </Portal.Entrance>
  )
}

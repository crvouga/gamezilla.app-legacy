import { cn } from '~/@/ui'
import { FormButtons } from '../form-buttons'
import { ScreenActionsSideBar } from '../screen-actions/side-bar'
import { ScreenNavBarTablet } from '../screen-nav-bar/tablet'
import { ScreenLayoutProps } from './props'

export const ScreenLayoutTablet = (input: ScreenLayoutProps) => {
  const Element = input.form ? 'form' : 'div'

  return (
    <Element
      className='flex w-full flex-1 flex-col overflow-hidden'
      onSubmit={(e) => {
        e.preventDefault()
        input.form?.onSubmit()
      }}
    >
      <div
        className={cn('flex w-full flex-1 gap-6 overflow-hidden', input.isTopLevel ? 'flex-row' : 'flex-row-reverse')}
      >
        {input.parent?.actions && (
          <ScreenActionsSideBar.View
            {...input.parent.actions}
            id={input.parent.actions.id ?? `${input.id}-parent-actions`}
            ctx={input.ctx}
          />
        )}

        {input.actions && (
          <ScreenActionsSideBar.View
            {...input.actions}
            id={input.actions.id ?? `${input.id}-actions`}
            ctx={input.ctx}
          />
        )}

        <div className='flex flex-1 flex-col overflow-hidden'>
          {input.nav && (
            <ScreenNavBarTablet
              ctx={input.ctx}
              onBack={input.nav.onBack}
              title={input.nav.title}
              renderEnd={() =>
                input.form && (
                  <div className='w-full max-w-xs'>
                    <FormButtons {...input.form} size='md' />
                  </div>
                )
              }
            />
          )}

          <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
            {input.renderBody()}
            {input.renderFab && <div className='absolute bottom-6 right-4 bg-black'>{input.renderFab()}</div>}
          </div>

          {input.renderMiniPlayer?.()}
          {input.parent?.renderMiniPlayer?.()}
        </div>
      </div>
    </Element>
  )
}

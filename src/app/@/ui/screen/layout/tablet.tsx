import { cn } from '~/@/ui'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { ScreenActionVerticalBar } from '../action-bar/vertical-bar'
import { ScreenNavBarTablet } from '../nav-bar/tablet'
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
          <ScreenActionVerticalBar.View
            {...input.parent.actions}
            id={input.parent.actions.id ?? `${input.id}-parent-actions`}
            ctx={input.ctx}
          />
        )}

        {input.actions && (
          <ScreenActionVerticalBar.View
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
                    <CancelSubmitButtons {...input.form} size='md' />
                  </div>
                )
              }
            />
          )}

          <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
            {input.renderBody()}
            {input.renderFab && <div className='absolute bottom-6 right-6 bg-black'>{input.renderFab()}</div>}
          </div>

          {input.renderMiniPlayer?.()}
          {input.parent?.renderMiniPlayer?.()}
        </div>
      </div>
    </Element>
  )
}

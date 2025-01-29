import { cn } from '~/@/ui'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { ScreenActionVerticalBar } from '../action-bar/vertical-bar'
import { ScreenNavBarTablet } from '../nav-bar/tablet'
import { ScreenLayoutProps } from './props'

export const ScreenLayoutTablet = (input: ScreenLayoutProps) => {
  const Element = input.editAction ? 'form' : 'div'

  return (
    <Element
      className='flex w-full flex-1 flex-col overflow-hidden'
      onSubmit={(e) => {
        e.preventDefault()
        input.editAction?.onSubmit()
      }}
    >
      <div className={cn('flex w-full flex-1 overflow-hidden', input.isTopLevel ? 'flex-row' : 'flex-row-reverse')}>
        {input.parent?.actionBar && (
          <ScreenActionVerticalBar.View
            {...input.parent.actionBar}
            id={input.parent.actionBar.id ?? `${input.id}-parent-actions`}
            ctx={input.ctx}
          />
        )}

        {input.actionBar && (
          <ScreenActionVerticalBar.View
            {...input.actionBar}
            id={input.actionBar.id ?? `${input.id}-actions`}
            ctx={input.ctx}
          />
        )}

        <div
          className={cn(
            'flex flex-1 flex-col overflow-hidden',
            // input.isTopLevel ? 'border-l' : ''
          )}
        >
          {input.navBar && (
            <ScreenNavBarTablet
              ctx={input.ctx}
              onBack={input.navBar.onBack}
              title={input.navBar.title}
              renderEnd={() =>
                (input.editAction || input.renderFab) && (
                  <div className='flex w-full max-w-xs items-center justify-end'>
                    {input.editAction && <CancelSubmitButtons {...input.editAction} size='sm' />}
                    {input.renderFab?.()}
                  </div>
                )
              }
            />
          )}

          <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
            {input.renderBody()}
            {(input.renderFab || input.renderMiniPlayer || input.parent?.renderMiniPlayer) && (
              <div className='absolute bottom-8 right-8 bg-black'>
                {input.renderMiniPlayer?.()}
                {input.parent?.renderMiniPlayer?.()}
              </div>
            )}
          </div>
        </div>
      </div>
    </Element>
  )
}

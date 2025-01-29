import { Button, cn } from '~/@/ui'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { VerticalActionBar } from '../action-bar/vertical-action-bar'
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
          <VerticalActionBar
            {...input.parent.actionBar}
            id={input.parent.actionBar.id ?? `${input.id}-parent-actions`}
            ctx={input.ctx}
          />
        )}

        {input.actionBar && (
          <VerticalActionBar {...input.actionBar} id={input.actionBar.id ?? `${input.id}-actions`} ctx={input.ctx} />
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
                (input.editAction || input.createAction) && (
                  <div className='flex w-full max-w-xs items-center justify-end'>
                    {input.editAction && <CancelSubmitButtons {...input.editAction} size='sm' />}
                    {input.createAction && (
                      <Button
                        color='primary'
                        rounded
                        variant='contained'
                        size='sm'
                        onClick={input.createAction.onSubmit}
                        disabled={input.createAction.submitDisabled}
                        loading={input.createAction.submitLoading}
                        text={input.createAction.submitText}
                        iconStart={input.createAction.submitIcon}
                      />
                    )}
                  </div>
                )
              }
            />
          )}

          <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
            {input.renderBody()}
            {(input.createAction || input.renderMiniPlayer || input.parent?.renderMiniPlayer) && (
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

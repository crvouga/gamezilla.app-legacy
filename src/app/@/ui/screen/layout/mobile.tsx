import { Button } from '~/@/ui/button.tsx'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons.tsx'
import { HorizontalActionBar } from '../action-bar/horizontal-action-bar.tsx'
import { ScreenNavBarMobile } from '../nav-bar/mobile.tsx'
import { ScreenLayoutProps } from './props.tsx'

export const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
  const Element = input.editAction ? 'form' : 'div'
  const actionPosition = input.actionPosition ?? 'bottom'
  const actions = (
    <>
      {input.renderMiniPlayer?.()}
      {input.parentScreen?.renderMiniPlayer?.()}
      {input.actionBar && (
        <HorizontalActionBar {...input.actionBar} id={input.actionBar.id ?? `${input.id}-actions`} ctx={input.ctx} />
      )}
      {input.parentScreen?.actionBar && (
        <HorizontalActionBar
          {...input.parentScreen.actionBar}
          id={input.parentScreen.actionBar.id ?? `${input.id}-actions`}
          ctx={input.ctx}
        />
      )}
    </>
  )

  return (
    <Element
      className='flex w-full flex-1 flex-col overflow-hidden'
      onSubmit={(e) => {
        e.preventDefault()
        input.editAction?.onSubmit()
      }}
    >
      {input.navBar && <ScreenNavBarMobile ctx={input.ctx} onBack={input.navBar.onBack} title={input.navBar.title} />}
      {actionPosition === 'top' && actions}

      <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
        {input.renderBody()}
        {input.createAction && (
          <div className='absolute bottom-6 right-4 bg-black'>
            <Button
              color='primary'
              size='lg'
              variant='contained'
              rounded
              onClick={input.createAction.onSubmit}
              disabled={input.createAction.submitDisabled}
              loading={input.createAction.submitLoading}
              text={input.createAction.submitText}
              iconStart={input.createAction.submitIcon}
            />
          </div>
        )}
      </div>
      {input.editAction && <CancelSubmitButtons {...input.editAction} />}
      {actionPosition === 'bottom' && actions}
    </Element>
  )
}

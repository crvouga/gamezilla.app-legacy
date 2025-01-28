import { CancelSubmitButtons } from '../../form/cancel-submit-buttons.tsx'
import { ScreenActionHorizontalBar } from '../action-bar/horizontal-bar.tsx'
import { ScreenLayoutProps } from './props.tsx'
import { ScreenNavBarMobile } from '../nav-bar/mobile.tsx'

export const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
  const Element = input.form ? 'form' : 'div'
  const actionPosition = input.actionPosition ?? 'bottom'
  const actions = (
    <>
      {input.actionBar && (
        <>
          {input.renderMiniPlayer?.()}
          <ScreenActionHorizontalBar.View
            {...input.actionBar}
            id={input.actionBar.id ?? `${input.id}-actions`}
            ctx={input.ctx}
          />
        </>
      )}

      {input.parent?.actionBar && (
        <>
          {input.parent.renderMiniPlayer?.()}
          <ScreenActionHorizontalBar.View
            {...input.parent.actionBar}
            id={input.parent.actionBar.id ?? `${input.id}-actions`}
            ctx={input.ctx}
          />
        </>
      )}
    </>
  )

  return (
    <Element
      className='flex w-full flex-1 flex-col overflow-hidden'
      onSubmit={(e) => {
        e.preventDefault()
        input.form?.onSubmit()
      }}
    >
      {input.navBar && <ScreenNavBarMobile ctx={input.ctx} onBack={input.navBar.onBack} title={input.navBar.title} />}
      {actionPosition === 'top' && actions}

      <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
        {input.renderBody()}
        {input.renderFab && <div className='absolute bottom-6 right-4 bg-black'>{input.renderFab()}</div>}
      </div>
      {input.form && <CancelSubmitButtons {...input.form} />}
      {actionPosition === 'bottom' && actions}
    </Element>
  )
}

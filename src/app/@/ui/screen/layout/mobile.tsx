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
            id={input.actionBar.id ?? `${input.id}-actions`}
            ctx={input.ctx}
            actions={input.actionBar.actions}
            limit={input.actionBar.limit}
            size={input.actionBar.size}
            onToggle={input.actionBar.onToggle}
            open={input.actionBar.open}
          />
        </>
      )}

      {input.parent?.actionBar && (
        <>
          {input.parent.renderMiniPlayer?.()}
          <ScreenActionHorizontalBar.View
            size={input.parent.actionBar.size}
            id={input.parent.actionBar.id ?? `${input.id}-actions`}
            ctx={input.ctx}
            actions={input.parent.actionBar.actions}
            limit={input.parent.actionBar.limit}
            onToggle={input.parent.actionBar.onToggle}
            open={input.parent.actionBar.open}
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

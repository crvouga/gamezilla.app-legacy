import { CancelSubmitButtons } from '../form/cancel-submit-buttons.tsx'
import { ScreenActionHorizontalBar } from './screen-action-bar/horizontal-bar.tsx'
import { ScreenLayoutProps } from './props'
import { ScreenNavBarMobile } from './screen-nav-bar/mobile.tsx'

export const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
  const Element = input.form ? 'form' : 'div'
  const actionPosition = input.actionPosition ?? 'bottom'
  const actions = (
    <>
      {input.actions && (
        <>
          {input.renderMiniPlayer?.()}
          <ScreenActionHorizontalBar.View
            id={input.actions.id ?? `${input.id}-actions`}
            ctx={input.ctx}
            actions={input.actions.actions}
            limit={input.actions.limit}
            size={input.actions.size}
            onToggle={input.actions.onToggle}
            open={input.actions.open}
          />
        </>
      )}

      {input.parent?.actions && (
        <>
          {input.parent.renderMiniPlayer?.()}
          <ScreenActionHorizontalBar.View
            size={input.parent.actions.size}
            id={input.parent.actions.id ?? `${input.id}-actions`}
            ctx={input.ctx}
            actions={input.parent.actions.actions}
            limit={input.parent.actions.limit}
            onToggle={input.parent.actions.onToggle}
            open={input.parent.actions.open}
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
      {input.nav && <ScreenNavBarMobile ctx={input.ctx} onBack={input.nav.onBack} title={input.nav.title} />}
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

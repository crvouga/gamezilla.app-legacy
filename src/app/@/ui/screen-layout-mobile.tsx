import { FormBottomButtons } from './form-button-buttons'
import { ScreenActions } from './screen-actions'
import { ScreenLayoutProps } from './screen-layout-props'
import { TopBar } from './top-bar'

export const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
  const Element = input.form ? 'form' : 'div'
  const actionPosition = input.actionPosition ?? 'bottom'
  const actions = (
    <>
      {input.actions && (
        <>
          {input.actions.top}
          <ScreenActions.View
            id={input.actions.id ?? `${input.id}-actions`}
            ctx={input.ctx}
            buttons={input.actions.buttons}
            limit={input.actions.limit}
            size={input.actions.size}
            onToggle={input.actions.onToggle}
            open={input.actions.open}
          />
        </>
      )}

      {input.parent?.actions && (
        <>
          {input.parent.actions.top}
          <ScreenActions.View
            size={input.parent.actions.size}
            id={input.parent.actions.id ?? `${input.id}-actions`}
            ctx={input.ctx}
            buttons={input.parent.actions.buttons}
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
      {input.topBar && <TopBar ctx={input.ctx} onBack={input.topBar.onBack} title={input.topBar.title} />}
      {actionPosition === 'top' && actions}

      <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
        {input.renderBody()}
        {input.renderFab && <div className='absolute bottom-6 right-4 bg-black'>{input.renderFab()}</div>}
      </div>
      {input.form && <FormBottomButtons {...input.form} />}
      {actionPosition === 'bottom' && actions}
    </Element>
  )
}

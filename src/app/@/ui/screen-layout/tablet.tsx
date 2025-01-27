import { FormBottomButtons } from '../form-button-buttons'
import { ScreenActionsSideBar } from '../screen-actions/side-bar'
import { ScreenLayoutProps } from './props'
import { ScreenNavBarTablet } from '../screen-nav-bar/tablet'

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
      <div className='flex w-full flex-1 flex-row overflow-hidden'>
        {input.actions && (
          <ScreenActionsSideBar.View
            id={input.actions.id ?? `${input.id}-actions`}
            ctx={input.ctx}
            buttons={input.actions.buttons}
            size={input.actions.size}
            open={input.actions.open}
            onToggle={input.actions.onToggle}
          />
        )}

        {input.parent?.actions && (
          <ScreenActionsSideBar.View
            id={input.parent.actions.id ?? `${input.id}-actions`}
            ctx={input.ctx}
            buttons={input.parent.actions.buttons}
            size={input.parent.actions.size}
            open={input.parent.actions.open}
            onToggle={input.parent.actions.onToggle}
          />
        )}

        <div className='flex flex-1 flex-col overflow-hidden'>
          {input.nav && <ScreenNavBarTablet ctx={input.ctx} onBack={input.nav.onBack} title={input.nav.title} />}

          <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
            {input.renderBody()}
            {input.renderFab && <div className='absolute bottom-6 right-4 bg-black'>{input.renderFab()}</div>}
          </div>

          {input.form && (
            <div className='flex w-full items-center justify-center'>
              <div className='w-full max-w-2xl'>
                <FormBottomButtons {...input.form} />
              </div>
            </div>
          )}
        </div>
      </div>
      {input.actions?.top}
      {input.parent?.actions?.top}
    </Element>
  )
}

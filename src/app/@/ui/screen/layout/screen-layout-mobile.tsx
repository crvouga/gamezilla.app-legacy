import { Button } from '~/@/ui/button.tsx'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons.tsx'
import { HorizontalActionBar } from '../action-bar/screen-action-bar-horizontal.tsx'
import { ScreenNavBarMobile } from '../nav-bar/screen-nav-bar-mobile.tsx'
import { ParentScreenProps, ScreenLayoutProps } from './screen-layout-props.tsx'

export const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
  const Element = input.editAction ? 'form' : 'div'

  const renderActionBars = (screen: ScreenLayoutProps | null): React.ReactNode[] => {
    if (!screen) return []
    const bars = []
    if (screen.actionBar) {
      const position = screen.actionBar.position ?? 'bottom'
      bars.push(
        <div key={screen.id} className={position === 'top' ? 'order-first' : 'order-last'}>
          {screen.renderMiniPlayer?.()}
          <HorizontalActionBar
            {...screen.actionBar}
            id={screen.actionBar.id ?? `${screen.id}-actions`}
            ctx={screen.ctx}
            key={screen.id}
          />
        </div>,
      )
    }
    if (screen.parentScreen) {
      bars.push(...renderActionBars(screen.parentScreen as ScreenLayoutProps))
    }
    return bars
  }

  const renderNavBars = (ctx: ScreenLayoutProps['ctx'], screen: ParentScreenProps | null): React.ReactNode[] => {
    if (!screen) return []
    const bars = []
    if (screen.navBar) {
      bars.push(
        <ScreenNavBarMobile key={screen.id} ctx={ctx} onBack={screen.navBar.onBack} title={screen.navBar.title} />,
      )
    }
    if (screen.parentScreen) {
      bars.push(...renderNavBars(ctx, screen.parentScreen))
    }
    return bars
  }

  const actionBars = renderActionBars(input)
  const topBars = actionBars.filter((_, i) => {
    if (i === 0) return input.actionBar?.position === 'top'
    return input.parentScreen?.actionBar?.position === 'top'
  })
  const bottomBars = actionBars.filter((_, i) => {
    if (i === 0) return input.actionBar?.position !== 'top'
    return input.parentScreen?.actionBar?.position !== 'top'
  })

  return (
    <Element
      className='flex w-full flex-1 flex-col overflow-hidden'
      onSubmit={(e) => {
        e.preventDefault()
        input.editAction?.onSubmit()
      }}
    >
      {topBars}

      {renderNavBars(input.ctx, input)}

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

      {bottomBars}
    </Element>
  )
}

import { Button, cn } from '~/@/ui'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { VerticalActionBar } from '../action-bar/screen-action-bar-vertical'
import { ScreenNavBarTablet } from '../nav-bar/screen-nav-bar-tablet'
import { ScreenLayoutProps } from './screen-layout-props'

export const ScreenLayoutTablet = (input: ScreenLayoutProps) => {
  const Element = input.editAction ? 'form' : 'div'

  const renderActionBars = (screen: ScreenLayoutProps | null): React.ReactNode[] => {
    if (!screen) return []
    const bars = []
    if (screen.actionBar) {
      const isTopLevel = !Boolean(screen.parentScreen)
      bars.push(
        <div className={cn(isTopLevel ? 'order-first' : 'order-last')}>
          <VerticalActionBar
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

  const renderNavBars = (screen: ScreenLayoutProps | null): React.ReactNode[] => {
    if (!screen) return []
    const bars = []
    if (screen.navBar) {
      bars.push(
        <ScreenNavBarTablet
          key={screen.id}
          ctx={screen.ctx}
          onBack={screen.navBar.onBack}
          title={screen.navBar.title}
          renderEnd={() =>
            (screen.editAction || screen.createAction) && (
              <div className='flex w-fit items-center justify-end'>
                {screen.editAction && <CancelSubmitButtons {...screen.editAction} size='sm' />}
                {screen.createAction && (
                  <Button
                    color='primary'
                    rounded
                    variant='contained'
                    size='sm'
                    onClick={screen.createAction.onSubmit}
                    disabled={screen.createAction.submitDisabled}
                    loading={screen.createAction.submitLoading}
                    text={screen.createAction.submitText}
                    iconStart={screen.createAction.submitIcon}
                  />
                )}
              </div>
            )
          }
        />,
      )
    }
    if (screen.parentScreen) {
      bars.push(...renderNavBars(screen.parentScreen as ScreenLayoutProps))
    }
    return bars
  }

  const renderMiniPlayers = (screen: ScreenLayoutProps | null): React.ReactNode[] => {
    if (!screen) return []
    const players = []
    if (screen.renderMiniPlayer) {
      players.push(screen.renderMiniPlayer())
    }
    if (screen.parentScreen) {
      players.push(...renderMiniPlayers(screen.parentScreen as ScreenLayoutProps))
    }
    return players
  }

  return (
    <Element
      className='flex w-full flex-1 flex-col overflow-hidden'
      onSubmit={(e) => {
        e.preventDefault()
        input.editAction?.onSubmit()
      }}
    >
      <div className='flex w-full flex-1 flex-row overflow-hidden'>
        {renderActionBars(input)}

        <div className='flex flex-1 flex-col overflow-hidden'>
          {renderNavBars(input)}

          <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
            {input.renderBody()}
            {(input.createAction || input.renderMiniPlayer || input.parentScreen?.renderMiniPlayer) && (
              <div className='absolute bottom-8 right-8 bg-black'>{renderMiniPlayers(input)}</div>
            )}
          </div>
        </div>
      </div>
    </Element>
  )
}

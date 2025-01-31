import { Button, cn } from '~/@/ui'
import { VDom } from '~/@/vdom/vdom'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { VerticalActionBar } from '../action-bar/screen-action-bar-vertical'
import { ScreenNavBarTablet } from '../nav-bar/screen-nav-bar-tablet'
import { ParentScreenProps, ScreenLayoutProps } from './screen-layout-props'

const renderActionBars = (ctx: ScreenLayoutProps['ctx'], screen: ParentScreenProps | null): VDom[] => {
  if (!screen) return []
  const bars = []
  if (screen.actionBar) {
    const isTopLevel = !Boolean(screen.parentScreen)
    bars.push(
      <div key={screen.id} className={cn(isTopLevel ? 'order-first border-r' : 'order-last')}>
        <VerticalActionBar
          {...screen.actionBar}
          id={screen.actionBar.id ?? `${screen.id}-actions`}
          ctx={ctx}
          key={screen.id}
        />
      </div>,
    )
  }
  if (screen.parentScreen) {
    bars.push(...renderActionBars(ctx, screen.parentScreen))
  }
  return bars
}

const renderNavBars = (ctx: ScreenLayoutProps['ctx'], screen: ParentScreenProps | null): VDom[] => {
  if (!screen) return []
  const bars = []
  if (screen.navBar) {
    bars.push(
      <ScreenNavBarTablet
        key={screen.id}
        ctx={ctx}
        onBack={screen.navBar.onBack}
        title={screen.navBar.title}
        subtitle={screen.navBar.subtitle}
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
    bars.push(...renderNavBars(ctx, screen.parentScreen))
  }
  return bars
}

const renderMiniPlayers = (screen: ScreenLayoutProps | null): VDom[] => {
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
      <div className='relative flex w-full flex-1 flex-row overflow-hidden'>
        {renderActionBars(input.ctx, input)}

        <div className='flex max-w-2xl flex-1 flex-col overflow-hidden border-r'>
          {renderNavBars(input.ctx, input)}

          <div className='flex w-full flex-1 flex-col overflow-hidden'>
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

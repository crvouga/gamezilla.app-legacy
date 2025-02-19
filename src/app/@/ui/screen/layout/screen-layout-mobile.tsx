import { Button } from '~/@/ui/button.tsx'
import { VDom } from '~/@/vdom/vdom'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons.tsx'
import { HorizontalActionBar } from '../action-bar/screen-action-bar-horizontal.tsx'
import { ScreenNavBarMobile } from '../nav-bar/screen-nav-bar-mobile.tsx'
import { ParentScreenProps, ScreenLayoutProps } from './screen-layout-props.tsx'
import { DynamicElement } from '~/@/ui/dynamic-element.tsx'

export const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
  const element = input.patchAction ? 'form' : 'div'

  return (
    <DynamicElement
      element={element}
      className='flex w-full flex-1 flex-col overflow-hidden'
      onSubmit={(e) => {
        e.preventDefault()
        input.patchAction?.onSubmit()
      }}
    >
      {renderActionBars(input)}

      <div className='flex flex-1 flex-col overflow-hidden'>
        {renderNavBars(input.ctx, input)}

        <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
          {input.renderBody()}

          {input.postAction && (
            <Button
              className='absolute bottom-6 right-4'
              color='primary'
              size='lg'
              variant='contained'
              rounded
              onClick={input.postAction.onSubmit}
              disabled={input.postAction.submitDisabled}
              loading={input.postAction.submitLoading}
              text={input.postAction.submitText}
              renderIconStart={input.postAction.submitIcon}
            />
          )}
        </div>

        {input.patchAction && <CancelSubmitButtons {...input.patchAction} />}
      </div>
    </DynamicElement>
  )
}

const renderActionBars = (screen: ScreenLayoutProps | null): VDom[] => {
  if (!screen) return []
  const bars = []
  if (screen.actionBar) {
    const position = screen.actionBar.position ?? 'bottom'
    const id = screen.actionBar.id ?? `${screen.id}-${position}-actions`
    bars.push(
      <div key={id} className={position === 'top' ? 'order-first' : 'order-last'}>
        {screen.renderMiniPlayer?.({ key: `${id}-mini-player` })}
        <HorizontalActionBar {...screen.actionBar} id={id} ctx={screen.ctx} key={id} />
      </div>,
    )
  }
  if (screen.parentScreen) {
    bars.push(...renderActionBars(screen.parentScreen as ScreenLayoutProps))
  }
  return bars
}

const renderNavBars = (ctx: ScreenLayoutProps['ctx'], screen: ParentScreenProps | null): VDom[] => {
  if (!screen) return []
  const bars = []
  if (screen.navBar) {
    bars.push(
      <ScreenNavBarMobile
        key={screen.id}
        ctx={ctx}
        onBack={screen.navBar.onBack}
        title={screen.navBar.title}
        subtitle={screen.navBar.subtitle}
      />,
    )
  }
  if (screen.parentScreen) {
    bars.push(...renderNavBars(ctx, screen.parentScreen))
  }
  return bars
}

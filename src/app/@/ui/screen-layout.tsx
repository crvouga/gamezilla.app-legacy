import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { VDom, VDomChildren } from '~/@/vdom/vdom'
import { FormBottomButtons } from './form-button-buttons'
import { ScreenAction, ScreenActions } from './screen-actions'
import { TopBar } from './top-bar'

export type ScreenActionsProps = {
  id?: string
  limit?: number
  size?: 'sm' | 'md'
  top?: VDomChildren
  buttons: (ScreenAction | null)[]
  onToggle: () => void
  open: boolean
}

export type ScreenLayoutProps = {
  id: string
  ctx: {
    t: Translator
  }
  topBar?: {
    title: TranslatedText
    subtitle?: TranslatedText | null
    onBack?: () => void
  }
  actionPosition?: 'top' | 'bottom'
  parentActions?: ScreenActionsProps | null
  actions?: ScreenActionsProps | null
  renderBody: () => VDom
  form?: {
    onSubmit: () => void
    cancelText: TranslatedText
    submitText: TranslatedText
    onCancel: () => void
    submitLoading: boolean
    cancelDisabled: boolean
    submitDisabled: boolean
  }
}

/**
 * Primary screen layout component. Use this everywhere.
 */
export const ScreenLayout = (input: ScreenLayoutProps) => {
  const isMobile = true
  if (isMobile) return <ScreenLayoutMobile {...input} />
  return <ScreenLayoutDesktop {...input} />
}

const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
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

      {input.parentActions && (
        <>
          {input.parentActions.top}
          <ScreenActions.View
            size={input.parentActions.size}
            id={input.parentActions.id ?? `${input.id}-actions`}
            ctx={input.ctx}
            buttons={input.parentActions.buttons}
            limit={input.parentActions.limit}
            onToggle={input.parentActions.onToggle}
            open={input.parentActions.open}
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

      <div className='flex w-full flex-1 flex-col overflow-hidden'>{input.renderBody()}</div>
      {input.form && <FormBottomButtons {...input.form} />}
      {actionPosition === 'bottom' && actions}
    </Element>
  )
}

const ScreenLayoutDesktop = (input: ScreenLayoutProps) => {
  return <ScreenLayoutMobile {...input} />
}

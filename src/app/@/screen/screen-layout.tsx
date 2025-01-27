import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { VDomChildren } from '~/@/vdom/vdom'
import { FormBottomButtons } from './form-button-buttons'
import { ScreenAction, ScreenActions } from './screen-actions'
import { TopBar } from './top-bar'

export type ScreenActionsProps = {
  id?: string
  limit?: number
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
  parentActions?: ScreenActionsProps | null
  actions?: ScreenActionsProps | null
  main: VDomChildren
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
  const isMobile = false
  if (isMobile) return <ScreenLayoutMobile {...input} />
  return <ScreenLayoutDesktop {...input} />
}

const ScreenLayoutDesktop = (input: ScreenLayoutProps) => {
  const Element = input.form ? 'form' : 'div'
  return (
    <Element
      className='flex w-full flex-1 flex-col overflow-hidden'
      onSubmit={(e) => {
        e.preventDefault()
        input.form?.onSubmit()
      }}
    >
      {input.topBar && <TopBar ctx={input.ctx} onBack={input.topBar.onBack} title={input.topBar.title} />}

      <div className='flex w-full flex-1 flex-col overflow-hidden'>{input.main}</div>

      {input.form && <FormBottomButtons {...input.form} />}

      {input.actions && (
        <>
          {input.actions.top}
          <ScreenActions.View
            id={input.actions.id ?? `${input.id}-bottom-buttons`}
            ctx={input.ctx}
            buttons={input.actions.buttons}
            limit={input.actions.limit}
            onToggle={input.actions.onToggle}
            open={input.actions.open}
          />
        </>
      )}

      {input.parentActions && (
        <>
          {input.parentActions.top}
          <ScreenActions.View
            id={input.parentActions.id ?? `${input.id}-bottom-buttons`}
            ctx={input.ctx}
            buttons={input.parentActions.buttons}
            limit={input.parentActions.limit}
            onToggle={input.parentActions.onToggle}
            open={input.parentActions.open}
          />
        </>
      )}
    </Element>
  )
}

const ScreenLayoutMobile = (input: ScreenLayoutProps) => {
  const Element = input.form ? 'form' : 'div'
  return (
    <Element
      className='flex w-full flex-1 flex-col overflow-hidden'
      onSubmit={(e) => {
        e.preventDefault()
        input.form?.onSubmit()
      }}
    >
      {input.topBar && <TopBar ctx={input.ctx} onBack={input.topBar.onBack} title={input.topBar.title} />}

      <div className='flex w-full flex-1 flex-col overflow-hidden'>{input.main}</div>

      {input.form && <FormBottomButtons {...input.form} />}

      {input.actions && (
        <>
          {input.actions.top}
          <ScreenActions.View
            id={input.actions.id ?? `${input.id}-bottom-buttons`}
            ctx={input.ctx}
            buttons={input.actions.buttons}
            limit={input.actions.limit}
            onToggle={input.actions.onToggle}
            open={input.actions.open}
          />
        </>
      )}

      {input.parentActions && (
        <>
          {input.parentActions.top}
          <ScreenActions.View
            id={input.parentActions.id ?? `${input.id}-bottom-buttons`}
            ctx={input.ctx}
            buttons={input.parentActions.buttons}
            limit={input.parentActions.limit}
            onToggle={input.parentActions.onToggle}
            open={input.parentActions.open}
          />
        </>
      )}
    </Element>
  )
}

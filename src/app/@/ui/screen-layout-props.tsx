import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { VDom, VDomChildren } from '~/@/vdom/vdom'
import { ScreenAction } from './screen-actions'

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
  parent?: Pick<ScreenLayoutProps, 'actions' | 'topBar'> | null
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

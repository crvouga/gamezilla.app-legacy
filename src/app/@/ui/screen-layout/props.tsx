import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { VDom, VDomChildren } from '~/@/vdom/vdom'
import { ScreenActionProps } from '../screen-actions/props'

export type ScreenLayoutActionsProps = Omit<ScreenActionProps, 'id' | 'ctx'> &
  Partial<Pick<ScreenActionProps, 'id' | 'ctx'>> & {
    top?: VDomChildren
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
  actions?: ScreenLayoutActionsProps | null
  renderBody: () => VDom
  renderFab?: () => VDom
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

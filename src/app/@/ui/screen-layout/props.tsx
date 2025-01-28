import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '../../frontend/screen-size'
import { ScreenActionProps } from './screen-action-bar/props'

export type ScreenLayoutActionsProps = Partial<ScreenActionProps> & {
  actions: ScreenActionProps['actions']
  open: ScreenActionProps['open']
  onToggle: ScreenActionProps['onToggle']
}

export type ScreenLayoutProps = {
  id: string
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  nav?: {
    title: TranslatedText
    subtitle?: TranslatedText | null
    onBack?: () => void
  }
  isTopLevel?: boolean
  actionPosition?: 'top' | 'bottom'
  parent?: Pick<ScreenLayoutProps, 'actions' | 'nav' | 'renderMiniPlayer'> | null
  actions?: ScreenLayoutActionsProps | null
  renderMiniPlayer?: () => VDom
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

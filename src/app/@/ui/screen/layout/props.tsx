import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '../screen-size'
import { ScreenActionBarProps } from '../action-bar/props'

export type ScreenLayoutActionBarProps = Partial<ScreenActionBarProps> & {
  actions: ScreenActionBarProps['actions']
  open: ScreenActionBarProps['open']
  onToggle: ScreenActionBarProps['onToggle']
}

export type ScreenLayoutFormProps = {
  onSubmit: () => void
  cancelText: TranslatedText
  submitText: TranslatedText
  onCancel: () => void
  submitLoading: boolean
  cancelDisabled: boolean
  submitDisabled: boolean
}

export type ScreenLayoutNavBarProps = {
  title: TranslatedText
  subtitle?: TranslatedText | null
  onBack?: () => void
}

export type ScreenLayoutProps = {
  id: string
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  navBar?: ScreenLayoutNavBarProps
  isTopLevel?: boolean
  actionPosition?: 'top' | 'bottom'
  parent?: Pick<ScreenLayoutProps, 'actionBar' | 'navBar' | 'renderMiniPlayer'> | null
  actionBar?: ScreenLayoutActionBarProps | null
  renderMiniPlayer?: () => VDom
  renderBody: () => VDom
  renderFab?: () => VDom
  form?: ScreenLayoutFormProps
}

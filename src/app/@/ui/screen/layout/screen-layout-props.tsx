import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '../screen-size'
import { ScreenActionBarProps } from '../action-bar/props'

export type ScreenLayoutActionBarProps = Partial<ScreenActionBarProps> & {
  variant: ScreenActionBarProps['variant']
  position?: 'top' | 'bottom'
}

export type EditActionProps = {
  onSubmit: () => void
  cancelText: TranslatedText
  submitText: TranslatedText
  onCancel: () => void
  submitLoading: boolean
  cancelDisabled: boolean
  submitDisabled: boolean
}

export type CreateActionProps = {
  submitIcon: (input: { className?: string }) => VDom
  onSubmit: () => void
  submitText: TranslatedText
  submitLoading: boolean
  submitDisabled: boolean
}

export type NavBarProps = {
  title: TranslatedText
  subtitle?: TranslatedText | null
  onBack?: () => void
}

export type ParentScreenProps = Pick<ScreenLayoutProps, 'actionBar' | 'navBar' | 'renderMiniPlayer' | 'parentScreen'>

export type ScreenLayoutProps = {
  id: string
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  parentScreen: ParentScreenProps | null
  navBar?: NavBarProps
  actionBar?: ScreenLayoutActionBarProps | null
  renderMiniPlayer?: () => VDom
  renderBody: () => VDom
  createAction?: CreateActionProps | null
  editAction?: EditActionProps
}

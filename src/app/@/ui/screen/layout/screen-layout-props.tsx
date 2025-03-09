import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '../screen-size'
import { ScreenActionBarProps } from '../action-bar/screen-action-bar-props'

export type ScreenLayoutActionBarProps = Partial<ScreenActionBarProps> & {
  variant: ScreenActionBarProps['variant']
  position?: 'top' | 'bottom'
}

export type PatchActionProps = {
  onSubmit: () => void
  cancelText: TranslatedText
  submitText: TranslatedText
  onCancel: () => void
  submitLoading: boolean
  cancelDisabled: boolean
  submitDisabled: boolean
}

export type PostActionProps = {
  submitIcon: (input: { className?: string }) => VDom
  onSubmit: () => void
  submitText: TranslatedText
  submitLoading: boolean
  submitDisabled: boolean
}

export type NavBarBackProps = {
  onClick?: () => void
  renderSurface?: (input: { reference: VDom }) => VDom
}

export type NavBarProps = {
  title?: TranslatedText | null
  subtitle?: TranslatedText | null
  back?: NavBarBackProps | null
}

export type ParentScreenProps = Omit<ScreenLayoutProps, 'ctx' | 'renderBody'>

export type ScreenLayoutProps = {
  id: string
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  parentScreen: ParentScreenProps | null
  navBar?: NavBarProps | null
  actionBar?: ScreenLayoutActionBarProps | null
  renderMiniPlayer?: (input: { key: string }) => VDom
  renderBody: () => VDom
  postAction?: PostActionProps | null
  patchAction?: PatchActionProps
}

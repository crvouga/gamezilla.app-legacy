import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '../../screen/screen-size'

export type SurfaceLayoutProps = {
  id: string
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  ariaLabel: TranslatedText
  open: boolean
  onClose: () => void
  header?: {
    title: TranslatedText
    onClose?: () => void
  }
  position?: 'top' | 'bottom'
  body?: {
    render?: () => VDom
  }
  form?: {
    variant?: 'danger'
    onSubmit: () => void
    cancelText: TranslatedText
    submitText: TranslatedText
    onCancel: () => void
    submitLoading: boolean
    cancelDisabled: boolean
    submitDisabled: boolean
  }
}

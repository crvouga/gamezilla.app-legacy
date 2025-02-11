import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { DropDownAlignment } from '~/@/ui/drop-down/drop-down-alignment'
import { DropDownPosition } from '~/@/ui/drop-down/drop-down-position'
import { DrawerPosition } from '~/@/ui/surface-drawer/drawer-position'
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
  reference?: VDom
  header?: {
    render?: () => VDom
  }
  drawer?: {
    position?: DrawerPosition
  }
  dropDown?: {
    position?: DropDownPosition
    alignment?: DropDownAlignment
  }
  body?: {
    render?: () => VDom
  }
  form?: {
    variant?: 'danger' | 'default'
    onSubmit: () => void
    cancelText: TranslatedText
    submitText: TranslatedText
    onCancel: () => void
    submitLoading: boolean
    cancelDisabled: boolean
    submitDisabled: boolean
  }
}

import { TranslatedText } from '~/@/l18n'
import type { VDomChildren } from '~/@/vdom/vdom'

export type PrivateDrawerInput = {
  id: string
  onClose: () => void
  open: boolean
  position: 'bottom' | 'top'
}

export type DrawerInput = PrivateDrawerInput & {
  ariaLabel: TranslatedText
  children?: VDomChildren
}

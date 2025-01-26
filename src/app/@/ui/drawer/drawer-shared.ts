import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
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
  ctx: {
    t: Translator
  }
}

import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import type { VDom } from '~/@/vdom/vdom'
import { DrawerPosition } from './drawer-position'

export type PrivateDrawerInput = {
  id: string
  onClose: () => void
  open: boolean
  position: DrawerPosition
}

export type DrawerInput = PrivateDrawerInput & {
  ariaLabel: TranslatedText
  children?: VDom
  ctx: {
    t: Translator
  }
}

/**
 * This prevents a console error when closing the drawer. Something about hiding focused elements.
 */
export const preventConsoleErrorWhenClosingDrawer = (event: {
  currentTarget?: HTMLDivElement | HTMLButtonElement | HTMLFormElement | null
}) => {
  event.currentTarget?.blur()
}

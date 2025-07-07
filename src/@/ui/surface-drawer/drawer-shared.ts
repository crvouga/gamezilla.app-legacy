import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import type { VDom } from '~/@/vdom/vdom'
import { DrawerPosition } from './drawer-position'

export type DrawerPropsPrivate = {
  id: string
  onClose: () => void
  open: boolean
  position: DrawerPosition
}

export type DrawerProps = DrawerPropsPrivate & {
  ariaLabel: TranslatedText
  children?: VDom[]
  ctx: {
    t: Translator
  }
  testId?: string
}

/**
 * This prevents a console error when closing the drawer. Something about hiding focused elements.
 */
export const preventConsoleErrorWhenClosingDrawer = (event: unknown) => {
  if (
    typeof event === 'object' &&
    event !== null &&
    'currentTarget' in event &&
    typeof event.currentTarget === 'object' &&
    event.currentTarget !== null &&
    'blur' in event.currentTarget &&
    typeof event.currentTarget.blur === 'function'
  ) {
    event.currentTarget.blur()
  }
}

import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { DrawerComponent } from './drawer-component'
import type { PrivateDrawerInput } from './drawer-shared'
import { DrawerWebComponent } from './drawer-web-component'
import { Translator } from '~/@/l18n/generated'

export type DrawerInput = PrivateDrawerInput & {
  children?: VDom
  ariaLabel: TranslatedText
  ctx: {
    t: Translator
  }
}

export const USE_WEB_COMPONENT = false

export const Drawer = (input: DrawerInput): VDom => {
  if (USE_WEB_COMPONENT) {
    return <DrawerWebComponent {...input} />
  }

  return <DrawerComponent {...input} />
}

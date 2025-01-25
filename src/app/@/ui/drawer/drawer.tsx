import type { VDom, VDomChildren } from '~/@/vdom/vdom'
import type { PrivateDrawerInput } from './drawer-shared'
import { DrawerWebComponent } from './drawer-web-component'
import { TranslatedText } from '~/@/l18n'

export type DrawerInput = PrivateDrawerInput & {
  children?: VDomChildren
  ariaLabel: TranslatedText
}

export const Drawer = (input: DrawerInput): VDom => {
  return <DrawerWebComponent {...input} />
}

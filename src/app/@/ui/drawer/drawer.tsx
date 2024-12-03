import type { VDom, VDomChildren } from '~/@/vdom'
import type { PrivateDrawerInput } from './drawer-shared'
import { DrawerWebComponent } from './drawer-web-component'

export type DrawerInput = PrivateDrawerInput & {
  children?: VDomChildren
}

export const Drawer = (input: DrawerInput): VDom => {
  return <DrawerWebComponent {...input} />
}

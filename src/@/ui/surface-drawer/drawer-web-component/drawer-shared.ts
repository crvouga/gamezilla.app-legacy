import { Sub } from '~/@/sub'
import type { PrivateDrawerInput } from '../drawer-shared'

export type DrawerEvent = PrivateDrawerInput & {
  type: 'input'
}

export const drawerSub = Sub.create<DrawerEvent>()

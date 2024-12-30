import { PubSub } from '~/@/program/sub'
import type { PrivateDrawerInput } from '../drawer-shared'

export type DrawerEvent = PrivateDrawerInput & {
  type: 'input'
}

export const drawerSub = PubSub.create<DrawerEvent>()

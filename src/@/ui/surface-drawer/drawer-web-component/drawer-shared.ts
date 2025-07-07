import { Sub } from '~/@/sub'
import type { DrawerPropsPrivate } from '../drawer-shared'

export type DrawerEvent = DrawerPropsPrivate & {
  type: 'input'
}

export const drawerSub = Sub.create<DrawerEvent>()

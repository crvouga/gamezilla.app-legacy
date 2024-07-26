import { PubSub } from 'gamezilla-app/@/core'
import type { PrivateDrawerinput } from '../drawer-shared'

export type DrawerEvent = PrivateDrawerinput & {
  type: 'input'
}

export const drawerSub = PubSub.create<DrawerEvent>()

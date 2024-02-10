import { PubSub } from "gamezilla/@SHARED/core"

export type PrivateDrawerProps = {
  id: string
  onClose: () => void
  open: boolean
  position: "bottom" | "top"
}

export type DrawerEvent = PrivateDrawerProps & {
  type: "props"
}

export const drawerSub = PubSub.create<DrawerEvent>()

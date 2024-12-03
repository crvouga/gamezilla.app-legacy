import type { VDomChildren } from '~/@/vdom'

export type PrivateDrawerInput = {
  id: string
  onClose: () => void
  open: boolean
  position: 'bottom' | 'top'
}

export type DrawerInput = PrivateDrawerInput & {
  children?: VDomChildren
}

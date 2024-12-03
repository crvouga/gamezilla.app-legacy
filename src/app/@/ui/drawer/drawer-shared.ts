import type { VDomChildren } from '~/@/vdom'

export type PrivateDrawerinput = {
  id: string
  onClose: () => void
  open: boolean
  position: 'bottom' | 'top'
}

export type Drawerinput = PrivateDrawerinput & {
  children?: VDomChildren
}

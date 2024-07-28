import type { VDomChildren } from 'gamezilla-app/@/vdom'

export type PrivateDrawerinput = {
  id: string
  onClose: () => void
  open: boolean
  position: 'bottom' | 'top'
}

export type Drawerinput = PrivateDrawerinput & {
  children?: VDomChildren
}

import { VDom } from '~/@/vdom/vdom'

export type IPortal = {
  Entrance: (input: { portalId: string; children: VDom[] }) => VDom
  Exit: (input: { portalId: string }) => VDom
}

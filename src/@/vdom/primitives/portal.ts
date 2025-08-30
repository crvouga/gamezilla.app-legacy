import { h } from '../h'
import { VDom } from '../vdom'
import { tag } from '../vdom-engine/interface'

export type PortalEntranceProps = {
  children: VDom[]
}

export const PORTAL_ENTRANCE_TAG = tag('portal-entrance')

const Entrance = ({ children, ...props }: PortalEntranceProps) => {
  return h(PORTAL_ENTRANCE_TAG, props, children)
}

export const Portal = {
  Entrance,
}

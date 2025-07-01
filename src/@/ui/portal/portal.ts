import { IPortal } from './interface'
// import { Portal as PortalWebComponent } from './portal-web-component'
import { Portal as PortalVdom } from './portal-vdom'

export const Portal: IPortal = {
  Entrance: PortalVdom.Entrance,
  Exit: PortalVdom.Exit,
}

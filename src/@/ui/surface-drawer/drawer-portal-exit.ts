import { h } from '~/@/vdom/h'
import { Portal } from '../portal'

export const DRAWER_PORTAL_ID = 'drawer-portal-exit'

export const DrawerPortalExit = () => {
  return h(Portal.Exit, { portalId: DRAWER_PORTAL_ID })
}

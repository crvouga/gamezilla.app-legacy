import { v } from '~/@/vdom/v'
import { Portal } from '../portal'

export const DRAWER_PORTAL_ID = 'drawer-portal-exit'

export const DrawerPortalExit = () => {
  return v(Portal.Exit, { portalId: DRAWER_PORTAL_ID })
}

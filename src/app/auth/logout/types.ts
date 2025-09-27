import { RemoteResult } from '~/@/result'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { AuthFrontendCtx } from '../@/frontend/ctx'

export type ModelFrontend = {
  request: RemoteResult<string, null>
  opened: 'logged-out' | null
}

export type MsgFrontend =
  | { t: 'clicked-logout-menu-item' }
  | { t: 'logout-drawer-closed' }
  | { t: 'logout-drawer-clicked-cancel' }
  | { t: 'logout-drawer-clicked-confirm' }

export type MsgToBackend = { t: 'noop' }

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToBackend: MsgToBackend
  Ctx: AuthFrontendCtx
}>

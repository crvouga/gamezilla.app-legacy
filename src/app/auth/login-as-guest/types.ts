import { RemoteResult, Result } from '~/@/result'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { UserAccount } from '~/app/@/data/user-account'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { isAnyMsg } from '~/@/msg/msg'

export type ModelFrontend = {
  loginAsGuest_request: RemoteResult<string, UserAccount>
}

export type MsgFrontend =
  | { t: 'loginAsGuest_clickedContinueAsGuestButton' }
  | { t: 'loginAsGuest_continueAsGuestResult'; result: Result<string, UserAccount> }

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('loginAsGuest_')
}

export type MsgToBackend = { t: 'noop' }

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: AuthFrontendCtx
}>

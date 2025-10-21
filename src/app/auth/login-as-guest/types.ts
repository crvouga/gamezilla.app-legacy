import { RemoteResult, Result } from '~/@/result'
import { UserAccount } from '~/app/@/data/user-account'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { AuthFrontendCtx } from '../@/frontend/ctx'

export type ModelFrontend = {
  loginAsGuest_request?: RemoteResult<string, UserAccount>
}

export type MsgFrontend =
  | { n: 'loginAsGuest'; t: 'loginAsGuest_clickedContinueAsGuestButton' }
  | { n: 'loginAsGuest'; t: 'loginAsGuest_continueAsGuestResult'; result: Result<string, UserAccount> }

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: AuthFrontendCtx
}>

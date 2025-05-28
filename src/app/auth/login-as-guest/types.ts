import { RemoteResult, Result } from '~/@/result'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { UserAccount } from '~/app/@/data/user-account'
import { AuthFrontendCtx } from '../@/frontend/ctx'

export type ModelFrontend = {
  request: RemoteResult<string, UserAccount>
}

export type MsgFrontend =
  | { t: 'clicked-continue-as-guest-button' }
  | { t: 'continue-as-guest-result'; result: Result<string, UserAccount> }

export type MsgToBackend = { t: 'noop' }

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: AuthFrontendCtx
}>

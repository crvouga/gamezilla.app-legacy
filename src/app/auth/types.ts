import { RPC } from '~/@/rpc'
import type { AppFrontendModule } from '../@/frontend/app-frontend-module'
import { AuthBackendCtx } from './@/backend/ctx'
import { AuthFrontendCtx } from './@/frontend/ctx'
import { CurrentUserTypes } from './current-user'
import type { ContinueAsGuest } from './login-as-guest'
import { LoginWithSMSTypes } from './login-with-sms'
import type { LogoutTypes } from './logout'

export type ModelFrontend = LogoutTypes.ModelFrontend &
  LoginWithSMSTypes.ModelFrontend &
  ContinueAsGuest.ModelFrontend &
  CurrentUserTypes.ModelFrontend

export type MsgFrontend =
  | { t: 'loginWithSms_clickedLoginWithPhone' }
  | { t: 'got-login-as-guest-msg'; c: ContinueAsGuest.MsgFrontend }
  | { t: 'got-login-with-sms-msg'; c: LoginWithSMSTypes.MsgFrontend }
  | { t: 'got-logout-msg'; c: LogoutTypes.MsgFrontend }
  | { t: 'got-current-user-msg'; c: CurrentUserTypes.MsgFrontend }

export type FrontendCtxModule = AuthFrontendCtx & {
  rpc: RPC.Client<typeof rpcContract>
}

export type BackendCtxModule = AuthBackendCtx

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: FrontendCtxModule
}>

export const rpcContract = RPC.combineContracts([LoginWithSMSTypes.rpcContract, CurrentUserTypes.rpcContract])

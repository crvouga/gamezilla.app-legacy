import { RPC } from '~/@/rpc'
import { AuthBackendCtx } from './@/backend/ctx'
import { AuthFrontendCtx } from './@/frontend/ctx'
import { CurrentUserFrontend, CurrentUserTypes } from './current-user'
import type { ContinueAsGuest } from './login-as-guest'
import { LoginWithSMSFrontend, LoginWithSMSTypes } from './login-with-sms'
import type { LogoutFrontend } from './logout'

export type ModelFrontend = {
  logout: LogoutFrontend.ModelFrontend
  loginWithSms: LoginWithSMSFrontend.Model
  continueAsGuest: ContinueAsGuest.ModelFrontend
  currentUser: CurrentUserFrontend.ModelFrontend
}

export type MsgBase = { n: 'auth'; t: 'auth_clickedLoginWithPhone' }

export type MsgFrontend =
  | MsgBase
  | { t: 'continueAsGuest'; c: ContinueAsGuest.MsgFrontend }
  | { t: 'loginWithSms'; c: LoginWithSMSFrontend.MsgFrontend }
  | { t: 'logout'; c: LogoutFrontend.Msg }
  | { t: 'currentUser'; c: CurrentUserFrontend.MsgFrontend }

export type FrontendCtxModule = AuthFrontendCtx & {
  rpc: RPC.Client<typeof rpcContract>
}

export type BackendCtxModule = AuthBackendCtx

export const rpcContract = RPC.combineContracts([LoginWithSMSTypes.rpcContract, CurrentUserTypes.rpcContract])

import { isAnyMsg } from '~/@/msg/msg'
import { RPC } from '~/@/rpc'
import { AuthBackendCtx } from './@/backend/ctx'
import { AuthFrontendCtx } from './@/frontend/ctx'
import { CurrentUserFrontend, CurrentUserTypes } from './current-user'
import type { ContinueAsGuest } from './login-as-guest'
import { LoginWithSMSFrontend, LoginWithSMSTypes } from './login-with-sms'
import type { LogoutFrontend } from './logout'

export type ModelFrontend = LogoutFrontend.ModelFrontend &
  LoginWithSMSFrontend.Model &
  ContinueAsGuest.ModelFrontend &
  CurrentUserFrontend.ModelFrontend

export type MsgBase = { t: 'auth_clickedLoginWithPhone' }

export const isMsgBase = (msg: unknown): msg is MsgBase => {
  return isAnyMsg(msg) && msg.t.startsWith('auth_')
}

export type MsgFrontend =
  | MsgBase
  | ContinueAsGuest.MsgFrontend
  | LoginWithSMSFrontend.MsgFrontend
  | LogoutFrontend.Msg
  | CurrentUserFrontend.MsgFrontend

export type FrontendCtxModule = AuthFrontendCtx & {
  rpc: RPC.Client<typeof rpcContract>
}

export type BackendCtxModule = AuthBackendCtx

export const rpcContract = RPC.combineContracts([LoginWithSMSTypes.rpcContract, CurrentUserTypes.rpcContract])

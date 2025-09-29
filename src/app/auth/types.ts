import { isAnyMsg } from '~/@/msg/msg'
import { RPC } from '~/@/rpc'
import type { AppFrontendModule } from '../@/frontend/app-frontend-module'
import { AuthBackendCtx } from './@/backend/ctx'
import { AuthFrontendCtx } from './@/frontend/ctx'
import { CurrentUserTypes } from './current-user'
import type { ContinueAsGuest } from './login-as-guest'
import { LoginWithSMSFrontend, LoginWithSMSTypes } from './login-with-sms'
import type { LogoutFrontend } from './logout'

export type ModelFrontend = LogoutFrontend.ModelFrontend &
  LoginWithSMSFrontend.ModelFrontend &
  ContinueAsGuest.ModelFrontend &
  CurrentUserTypes.ModelFrontend

export type MsgBase = { t: 'auth_clickedLoginWithPhone' }

export const isMsgBase = (msg: unknown): msg is MsgBase => {
  return isAnyMsg(msg) && msg.t.startsWith('auth_')
}

export type MsgFrontend =
  | MsgBase
  | ContinueAsGuest.MsgFrontend
  | LoginWithSMSFrontend.MsgFrontend
  | LogoutFrontend.Msg
  | CurrentUserTypes.MsgFrontend

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

import { RPC } from '~/@/rpc'
import type { AppBackendModule } from '../@/architecture/app-backend'
import type { AppFrontendModule } from '../@/architecture/app-frontend'
import { BackendCmd } from '../@/backend/cmd'
import { BackendEvt } from '../@/backend/evt'
import { BackendCtx } from './@/backend/ctx'
import { AuthFrontendCtx } from './@/frontend/ctx'
import { CurrentUserTypes } from './current-user'
import type { ContinueAsGuest } from './login-as-guest'
import { LoginWithSMSTypes } from './login-with-sms'
import type { LogoutTypes } from './logout'

export type { BackendCtx }

//
//
//
//
//
//

export type ModelFrontend = {
  logout: LogoutTypes.ModelFrontend
  continueWithSms: LoginWithSMSTypes.ModelFrontend
  continueAsGuest: ContinueAsGuest.ModelFrontend
  currentUser: CurrentUserTypes.ModelFrontend
}

//
//
// Msg
//
//

export type MsgFrontend =
  | { t: 'user-clicked-login-with-phone' }
  | { t: 'got-login-as-guest-msg'; c: ContinueAsGuest.MsgFrontend }
  | { t: 'got-login-with-sms-msg'; c: LoginWithSMSTypes.MsgFrontend }
  | { t: 'got-logout-msg'; c: LogoutTypes.MsgFrontend }
  | { t: 'got-current-user-msg'; c: CurrentUserTypes.MsgFrontend }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend =
  | { t: 'got-logout-msg'; c: LogoutTypes.MsgToBackend }
  | { t: 'got-current-user-msg'; c: CurrentUserTypes.MsgToBackend }
  | { t: 'got-login-as-guest-msg'; c: ContinueAsGuest.MsgToBackend }
  | { t: 'got-login-with-sms-msg'; c: LoginWithSMSTypes.MsgToBackend }

export type MsgToFrontend = { t: 'noop' }

export type FrontendCtx = AuthFrontendCtx & {
  rpc: {
    auth: RPC.Client<typeof rpcContract>
  }
}

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: FrontendCtx
}>

export type BackendModule = AppBackendModule<{
  Ctx: BackendCtx
  MsgCmdIn: null
  MsgEvtIn: BackendEvt
  Model: null
  Msg: MsgBackend
  MsgCmdOut: BackendCmd<MsgToFrontend>
  MsgEvtOut: BackendEvt
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Deps: null
}>

export const rpcContract = RPC.initContract({
  sms: LoginWithSMSTypes.rpcContract,
  currentUser: CurrentUserTypes.rpcContract,
})

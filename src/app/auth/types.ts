import type { RemoteResult } from '~/@/result'
import { RPC } from '~/@/rpc'
import type { AppBackendModule } from '../@/architecture/app-backend'
import type { AppFrontendModule } from '../@/architecture/app-frontend'
import { BackendCmd } from '../@/backend/cmd'
import { BackendEvt } from '../@/backend/evt'
import type { UserAccount } from '../@/data/account'
import type { AppFrontendCmd, AuthCmd } from '../@/frontend/cmd'
import { AppFrontendEvt } from '../@/frontend/evt'
import { BackendCtx } from './@/backend/ctx'
import { AuthFrontendCtx } from './@/frontend/ctx'
import type { ContinueAsGuest } from './continue-as-guest'
import { ContinueWithSmsTypes } from './continue-with-sms'
import { CurrentUserTypes } from './current-user'
import type { Logout } from './logout'

export type { BackendCtx }

//
//
//
//
//
//

type BaseModelFrontend = {
  loginWithGoogle: RemoteResult<string, null>
  logout: RemoteResult<string, null>
  opened: 'logged-out' | null
  sms: ContinueWithSmsTypes.ModelFrontend
  currentUser: CurrentUserTypes.ModelFrontend
}

export type ModelFrontend = BaseModelFrontend & ContinueAsGuest.ModelFrontend & Logout.ModelFrontend

//
//
// Msg
//
//

export type MsgFrontend =
  | ContinueAsGuest.MsgFrontend
  | Logout.MsgFrontend
  | { t: 'user-clicked-login-with-phone' }
  | { t: 'user-clicked-login-with-email' }
  | { t: 'sms'; c: ContinueWithSmsTypes.MsgFrontend }
  | { t: 'current-user'; c: CurrentUserTypes.MsgFrontend }

export type MsgBackend =
  | ContinueAsGuest.MsgBackend
  | Logout.MsgFrontend
  | { t: 'sms'; c: ContinueWithSmsTypes.MsgBackend }

export type MsgToBackend =
  | ContinueAsGuest.MsgToBackend
  | Logout.MsgToBackend
  | { t: 'frontend-checked-auth' }
  | { t: 'sms'; c: ContinueWithSmsTypes.MsgToBackend }

export type MsgToFrontend =
  | ContinueAsGuest.MsgToFrontend
  | Logout.MsgToFrontend
  | {
      t: 'client-authenticated'
      account: UserAccount
      loggedIn: boolean
    }
  | { t: 'client-unauthenticated'; sessionId?: never }
  | { t: 'sms'; c: ContinueWithSmsTypes.MsgToFrontend }

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
  MsgCmdIn: AuthCmd
  MsgEvtIn: AppFrontendEvt
  MsgCmdOut: AppFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>
  MsgEvtOut: AppFrontendEvt
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
  sms: ContinueWithSmsTypes.rpcContract,
  currentUser: CurrentUserTypes.rpcContract,
})

import type { RemoteResult } from '~/@/result'
import { RPC } from '~/@/rpc'
import { TimeSpan } from '~/@/time/time-span'
import type { AppBackendModule } from '../@/architecture/app-backend'
import type { AppFrontendModule } from '../@/architecture/app-frontend'
import { BackendCmd } from '../@/backend/cmd'
import { AppBackendCtx } from '../@/backend/ctx'
import { BackendEvt } from '../@/backend/evt'
import type { UserAccount } from '../@/data/account'
import type { AppFrontendCmd, AuthCmd } from '../@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx } from '../@/frontend/ctx'
import { AppFrontendEvt } from '../@/frontend/evt'
import { IGuestSessionMappingDb } from './@/guest-session-mapping-db'
import type { IUserAccountDb } from './@/user-account-db'
import type { IUserSessionDb } from './@/user-session-db'
import type { ContinueAsGuest } from './continue-as-guest'
import * as AuthSMS from './continue-with-sms/types'
import type { Logout } from './logout'

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
  currentUser:
    | { t: 'loading' }
    | { t: 'logged-out' }
    | {
        t: 'logged-in'
        account: UserAccount
      }
  sms: AuthSMS.ModelFrontend
}

export type ModelFrontend = BaseModelFrontend & ContinueAsGuest.ModelFrontend & Logout.ModelFrontend

export type BackendCtx = AppBackendCtx &
  AuthSMS.BackendCtx & {
    userAccountDb: IUserAccountDb
    userSessionDb: IUserSessionDb
    guestSessionMappingDb: IGuestSessionMappingDb
    sleep: (timeSpan: TimeSpan) => Promise<unknown>
  }

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
  | { t: 'sms'; c: AuthSMS.MsgFrontend }

export type MsgBackend = ContinueAsGuest.MsgBackend | Logout.MsgFrontend | { t: 'sms'; c: AuthSMS.MsgBackend }

export type MsgToBackend =
  | ContinueAsGuest.MsgToBackend
  | Logout.MsgToBackend
  | { t: 'frontend-checked-auth' }
  | { t: 'sms'; c: AuthSMS.MsgToBackend }

export type MsgToFrontend =
  | ContinueAsGuest.MsgToFrontend
  | Logout.MsgToFrontend
  | {
      t: 'client-authenticated'
      account: UserAccount
      loggedIn: boolean
    }
  | { t: 'client-unauthenticated'; sessionId?: never }
  | { t: 'sms'; c: AuthSMS.MsgToFrontend }

export type FrontendCtx = (AnonymousFrontendCtx | AppFrontendCtx) & {
  rpc: RPC.Client<typeof rpcContract>
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
  sms: AuthSMS.rpcContract,
})

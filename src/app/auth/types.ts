import type { RemoteResult } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'
import type { AppClientModule } from '../@/architecture/app-client'
import type { AppBackendModule } from '../@/architecture/app-server'
import type { AppClientCmd, AuthCmd } from '../@/client/cmd'
import { AnonymousClientCtx, AppClientCtx } from '../@/client/ctx'
import { ClientEvt } from '../@/client/evt'
import type { UserAccount } from '../@/data/account'
import { BackendCmd } from '../@/server/cmd'
import { AppBackendCtx } from '../@/server/ctx'
import { BackendEvt } from '../@/server/evt'
import { IGuestSessionMappingDb } from './@/server/guest-session-mapping-db'
import type { IUserAccountDb } from './@/server/user-account-db'
import type { IUserSessionDb } from './@/server/user-session-db'
import type * as AuthSMS from './auth-sms/types'
import type { ContinueAsGuest } from './continue-as-guest'
import type { Logout } from './logout'

//
//
//
//
//
//

type BaseModelClient = {
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
  sms: AuthSMS.ModelClient
}

export type ModelClient = BaseModelClient & ContinueAsGuest.ModelClient & Logout.ModelClient

export type BackendCtx = AppBackendCtx & {
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

export type MsgClient =
  | ContinueAsGuest.MsgClient
  | Logout.MsgClient
  | { t: 'user-clicked-login-with-phone' }
  | { t: 'user-clicked-login-with-email' }
  | { t: 'sms'; c: AuthSMS.MsgClient }

export type MsgBackend =
  | ContinueAsGuest.MsgBackend
  | Logout.MsgClient
  | {
      t: 'sms'
      c: AuthSMS.MsgBackend
    }

export type MsgToBackend =
  | ContinueAsGuest.MsgToBackend
  | Logout.MsgToBackend
  | { t: 'client-checked-auth' }
  | { t: 'sms'; c: AuthSMS.MsgToBackend }

export type MsgToClient =
  | ContinueAsGuest.MsgToClient
  | Logout.MsgToClient
  | {
      t: 'client-authenticated'
      account: UserAccount
      loggedIn: boolean
    }
  | { t: 'client-unauthenticated'; sessionId?: never }
  | { t: 'sms'; c: AuthSMS.MsgToClient }

export type ClientModule = AppClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  Ctx: AnonymousClientCtx | AppClientCtx
  MsgCmdIn: AuthCmd
  MsgEvtIn: ClientEvt
  MsgCmdOut: AppClientCmd<{
    MsgClient: MsgClient
    MsgToBackend: MsgToBackend
  }>
  MsgEvtOut: ClientEvt
}>

export type BackendModule = AppBackendModule<{
  Ctx: BackendCtx
  MsgCmdIn: null
  MsgEvtIn: BackendEvt
  Model: null
  Msg: MsgBackend
  MsgCmdOut: BackendCmd<MsgToClient>
  MsgEvtOut: BackendEvt
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  Deps: null
}>

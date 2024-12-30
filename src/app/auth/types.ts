import type { RemoteResult } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'
import type { AppClientModule } from '../@/architecture/app-client'
import type { AppServerModule } from '../@/architecture/app-server'
import type { AppClientCmd, AuthCmd } from '../@/client/client-cmd'
import { AnonymousClientCtx, AppClientCtx } from '../@/client/client-ctx'
import { ClientEvt } from '../@/client/client-event'
import type { UserAccount } from '../@/data/account'
import { ServerCmd } from '../@/server/server-cmd'
import { AppServerCtx } from '../@/server/server-ctx'
import { ServerEvt } from '../@/server/server-evt'
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

export type ServerCtx = AppServerCtx & {
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

export type MsgServer =
  | ContinueAsGuest.MsgServer
  | Logout.MsgClient
  | {
      t: 'sms'
      c: AuthSMS.MsgServer
    }

export type MsgToServer =
  | ContinueAsGuest.MsgToServer
  | Logout.MsgToServer
  | { t: 'client-checked-auth' }
  | { t: 'sms'; c: AuthSMS.MsgToServer }

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
  MsgToServer: MsgToServer
  Ctx: AnonymousClientCtx | AppClientCtx
  MsgCmdIn: AuthCmd
  MsgEvtIn: ClientEvt
  MsgCmdOut: AppClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgEvtOut: ClientEvt
}>

export type ServerModule = AppServerModule<{
  Ctx: ServerCtx
  MsgCmdIn: null
  MsgEvtIn: ServerEvt
  Model: null
  Msg: MsgServer
  MsgCmdOut: ServerCmd<MsgToClient>
  MsgEvtOut: ServerEvt
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Deps: null
}>

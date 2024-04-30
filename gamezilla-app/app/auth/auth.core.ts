import { RemoteResult, TimeSpan } from "gamezilla-app/@SHARED/core"
import { AppClientModule } from "../@SHARED/architecture/app-client"
import { AppServerModule } from "../@SHARED/architecture/app-server"
import {
  AnonymousClientCtx,
  AuthCmd,
  ClientCmd,
  ClientCtx,
  ClientEvent,
} from "../@SHARED/client"
import { UserAccount } from "../@SHARED/data/account"
import { ServerCmd, ServerCtx, ServerEvent } from "../@SHARED/server"
import * as AuthSMS from "./auth-sms/auth-sms.core"
import { IAccountDb } from "./@SHARED/server/account-db"
import { ISessionDb } from "./@SHARED/server/session-db"
import { ContinueAsGuest } from "./continue-as-guest"
import { Logout } from "./logout"

//
//
//
//
//
//

export type ClientModule = AppClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: AnonymousClientCtx | ClientCtx
  MsgInCmd: AuthCmd
  MsgInEvent: ClientEvent
  MsgOutCmd: ClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgOutEvent: ClientEvent
}>

export type ServerModule = AppServerModule<{
  Ctx: ServerCtx
  MsgInCmd: null
  MsgInEvent: ServerEvent
  Model: null
  Msg: MsgServer
  MsgOutCmd: ServerCmd<MsgToClient>
  MsgOutEvent: ServerEvent
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Deps: ServerDeps
}>

export type ServerDeps = {
  AccountDb: IAccountDb
  SessionDb: ISessionDb
  timeout: (timeSpan: TimeSpan) => Promise<void>
}

//
//
//
//
//
//

type BaseModelClient = {
  loginWithGoogle: RemoteResult<string, null>
  logout: RemoteResult<string, null>
  opened: "logged-out" | null
  currentUser:
    | { t: "loading" }
    | { t: "logged-out" }
    | { t: "logged-in"; account: UserAccount }
  sms: AuthSMS.ModelClient
}

export type ModelClient = BaseModelClient &
  ContinueAsGuest.ModelClient &
  Logout.ModelClient

//
//
// Msg
//
//

export type MsgClient =
  | ContinueAsGuest.MsgClient
  | Logout.MsgClient
  | { t: "user-clicked-login-with-phone" }
  | { t: "sms"; c: AuthSMS.MsgClient }

export type MsgServer =
  | ContinueAsGuest.MsgServer
  | Logout.MsgClient
  | {
      t: "sms"
      c: AuthSMS.MsgServer
    }

export type MsgToServer =
  | ContinueAsGuest.MsgToServer
  | Logout.MsgToServer
  | { t: "client-checked-auth" }
  | { t: "sms"; c: AuthSMS.MsgToServer }

export type MsgToClient =
  | ContinueAsGuest.MsgToClient
  | Logout.MsgToClient
  | { t: "client-authenticated"; account: UserAccount; loggedIn: boolean }
  | { t: "client-unauthenticated" }
  | { t: "sms"; c: AuthSMS.MsgToClient }

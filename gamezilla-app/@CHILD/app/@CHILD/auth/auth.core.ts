import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import {
  EmailAddress,
  PhoneNumber,
  Posix,
  RemoteResult,
  TimeSpan,
} from "gamezilla-app/@SHARED/core"
import { AppClientModule } from "../../@SHARED/architecture/app-client"
import { AppServerModule } from "../../@SHARED/architecture/app-server"
import {
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  ClientEvent,
} from "../../@SHARED/client"
import { ServerCmd, ServerCtx, ServerEvent } from "../../@SHARED/server"
import * as AuthSMS from "./@CHILD/auth-sms/auth-sms.core"
import { IAccountDb } from "./@SHARED/server/account-db"
import { ISessionDb } from "./@SHARED/server/session-db"
import { ContinueAsGuest } from "./continue-as-guest"

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
  MsgInCmd: never
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
  Model: ModelServer
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

type PhoneNumberOrEmail =
  | {
      phoneNumber?: PhoneNumber | null
      emailAddress: EmailAddress
    }
  | {
      phoneNumber: PhoneNumber
      emailAddress?: EmailAddress | null
    }
  | {
      phoneNumber: PhoneNumber
      emailAddress: EmailAddress
    }

type GuestAccount = {
  role: "guest"
  phoneNumber?: PhoneNumber | null
  emailAddress?: EmailAddress | null
}

type NormalAccount = PhoneNumberOrEmail & {
  role: "normal"
}

type SuperAccount = PhoneNumberOrEmail & {
  role: "super"
}

type AccountVariant = GuestAccount | NormalAccount | SuperAccount

type AccountBase = {
  userId: UserId
  createdAt: Posix
}

export type Account = AccountBase & AccountVariant

export type ModelClient = ContinueAsGuest.ModelClient & {
  loginWithGoogle: RemoteResult<string, null>
  logout: RemoteResult<string, null>
  currentUser:
    | { t: "loading" }
    | { t: "logged-out" }
    | { t: "logged-in"; userId: UserId; name?: string }
  sms: AuthSMS.ModelClient
}

export type ModelServer = {
  sms: AuthSMS.ModelServer
}

//
//
// Msg
//
//

export type MsgClient =
  | ContinueAsGuest.MsgClient
  | { t: "user-clicked-login-with-phone" }
  | { t: "logout"; c: LogoutMsg }
  | { t: "sms"; c: AuthSMS.MsgClient }

export type LogoutMsg =
  | { t: "clicked-confirm" }
  | { t: "clicked-cancel" }
  | { t: "closed" }

export type MsgServer =
  | ContinueAsGuest.MsgServer
  | {
      t: "sms"
      c: AuthSMS.MsgServer
    }

export type MsgToServer =
  | ContinueAsGuest.MsgToServer
  | { t: "logout" }
  | { t: "client-checked-auth" }
  | { t: "sms"; c: AuthSMS.MsgToServer }

export type MsgToClient =
  | ContinueAsGuest.MsgToClient
  | { t: "client-authenticated"; userId: UserId; loggedIn: boolean }
  | { t: "client-unauthenticated" }
  | { t: "sms"; c: AuthSMS.MsgToClient }

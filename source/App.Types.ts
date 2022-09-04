import * as Auth from "./Auth"
import { LocalStorage, Option } from "./Core"
import { UserId, ClientId, SessionId } from "./Data"
import * as GameRoom from "./GameRoom/GameRoom.Types"
import * as Party from "./Party/Party.Types"
import * as Page from "./Pages"
import * as Route from "./Route"
import * as Snackbar from "./Snackbar"
import * as Store from "./Store"

//
//
//
// Model
//
//
//

export type BackendModel = {
  sessions: {
    [sessionId: SessionId.SessionId]: Session
  }
  gameRoom: GameRoom.BackendModel
  party: Party.BackendModel
}

export type Session = {
  sessionId: SessionId.SessionId
  userId: Option.Option<UserId.UserId>
  connection: { type: "Connected", clientId: ClientId.ClientId } | { type: "Disconnected" }
}

export type FrontendModel = {
  snackbar: Snackbar.Model
  store: Store.Model
  auth: Auth.Model
  page: Page.Model
  route: Route.Model
  gameRoom: GameRoom.FrontendModel
  party: Party.FrontendModel
  wire: WireStatus
}

export type WireStatus =
  | "Connecting"
  | "ConnectError"
  | "Disconnected"
  | "Connected"

//
//
//
// Msg
//
//
//

export type ToBackend =
  | ["GameRoom", GameRoom.ToBackend]
  | ["Party", Party.ToBackend]
  | ["UserLoggedIn", UserId.UserId]

export type ToFrontend =
  | ["GameRoom", GameRoom.ToFrontend]
  | ["Party", Party.ToFrontend]
  | ["Session", SessionId.SessionId]

export type FrontendMsg =
  | ["[Backend]", ToFrontend]
  | ["Wire", WireStatus]
  | ["Route", Route.Msg]
  | ["Snackbar", Snackbar.Msg]
  | ["GameRoom", GameRoom.FrontendMsg]
  | ["Store", Store.Msg]
  | ["Auth", Auth.Msg]
  | ["Page", Page.Msg]
  | ["LocalStoragePutResulted", LocalStorage.PutResult]
  | ["Party", Party.FrontendMsg]

export type BackendMsg =
  | ["[Frontend]", SessionId.SessionId, ClientId.ClientId, ToBackend]
  | ["ClientConnected", SessionId.SessionId, ClientId.ClientId]
  | ["ClientDisconnected", SessionId.SessionId, ClientId.ClientId]
  | ["GameRoom", GameRoom.BackendMsg]
  | ["Party", Party.BackendMsg]

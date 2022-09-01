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
  clientId: ClientId.ClientId
  userId: Option.Option<UserId.UserId>
}

export type FrontendModel = {
  snackbar: Snackbar.Model
  store: Store.Model
  auth: Auth.Model
  page: Page.Model
  route: Route.Model
  gameRoom: GameRoom.FrontendModel
  bridge: ConnectionStatus
}

export type ConnectionStatus =
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
  | ["UserLoggedIn", UserId.UserId]

export type ToFrontend =
  | ["GameRoom", GameRoom.ToFrontend]
  | ["Session", SessionId.SessionId]

export type FrontendMsg =
  | ["[Backend]", ToFrontend]
  | ["Bridge", ConnectionStatus]
  | ["Route", Route.Msg]
  | ["Snackbar", Snackbar.Msg]
  | ["GameRoom", GameRoom.FrontendMsg]
  | ["Store", Store.Msg]
  | ["Auth", Auth.Msg]
  | ["Page", Page.Msg]
  | ["LocalStoragePutResulted", LocalStorage.PutResult]

export type BackendMsg =
  | ["[Frontend]", SessionId.SessionId, ClientId.ClientId, ToBackend]
  | ["ClientConnected", SessionId.SessionId, ClientId.ClientId]
  | ["ClientDisconnected", SessionId.SessionId, ClientId.ClientId]
  | ["GameRoom", GameRoom.BackendMsg]
  | ["Party", Party.BackendMsg]

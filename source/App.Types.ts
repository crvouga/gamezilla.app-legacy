import * as Auth from "./Auth/Auth"
import { LocalStorage, Option } from "./Core"
import { ClientId, SessionId, UserId } from "./Data"
import * as GameRoom from "./Game/GameRoom.Types"
import * as Page from "./Pages"
import * as Party from "./Party/Party.Types"
import * as Route from "./Route"
import * as Snackbar from "./Snackbar"
import * as ChatStore from "./Chat/Chat.Store"
import * as ProfileStore from "./Profile/Profile.Store"

//
//
//
// Model
//
//
//

export type BackendModel = {
  party: Party.BackendModel
  gameRoom: GameRoom.BackendModel
  sessions: {
    [sessionId: SessionId.SessionId]: Session
  }
}

export type Session = {
  sessionId: SessionId.SessionId
  userId: Option.Option<UserId.UserId>
  clientId: Option.Option<ClientId.ClientId>
}

export type FrontendModel = {
  snackbar: Snackbar.Model
  chatStore: ChatStore.Model
  auth: Auth.Model
  page: Page.Model
  route: Route.Model
  gameRoom: GameRoom.FrontendModel
  party: Party.FrontendModel
  wire: WireStatus
  profileStore: ProfileStore.Model
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
  | ["Auth", Auth.ToBackend]

export type ToFrontend =
  | ["GameRoom", GameRoom.ToFrontend]
  | ["Party", Party.ToFrontend]
  | ["Session", SessionId.SessionId]

export type FrontendMsg =
  | ["▶", ToFrontend]
  | ["Wire", WireStatus]
  | ["Route", Route.Msg]
  | ["Snackbar", Snackbar.Msg]
  | ["GameRoom", GameRoom.FrontendMsg]
  | ["Store", ChatStore.Msg]
  | ["Auth", Auth.Msg]
  | ["Page", Page.Msg]
  | ["LocalStoragePut_Done", LocalStorage.PutResult]
  | ["Party", Party.FrontendMsg]
  | ['ProfileStore', ProfileStore.Msg]

export type BackendMsg =
  | ["▶", SessionId.SessionId, ClientId.ClientId, ToBackend]
  | ["ClientConnected", SessionId.SessionId, ClientId.ClientId]
  | ["ClientDisconnected", SessionId.SessionId, ClientId.ClientId]
  | ["GameRoom", GameRoom.BackendMsg]
  | ["Party", Party.BackendMsg]

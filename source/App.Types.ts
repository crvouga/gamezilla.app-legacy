import * as GameRoom from "./GameRoom/GameRoom.Types"
import * as Page from "./Pages"
import * as Route from "./Route"
import * as Auth from "./Auth"
import * as Snackbar from "./Snackbar"
import * as Store from "./Store"
import { ClientId } from "./Data"

//
//
//
// Model
//
//
//

export type BackendModel = {
  clients: {
    [clientId: ClientId.ClientId]: {
      clientId: ClientId.ClientId
    }
  }
  gameRoom: GameRoom.BackendModel
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

export type ToBackend = ["GameRoom", GameRoom.ToBackend]

export type ToFrontend = ["GameRoom", GameRoom.ToFrontend]

export type FrontendMsg =
  | ["[Backend]", ToFrontend]
  | ["Bridge", ConnectionStatus]
  | ["Route", Route.Msg]
  | ["Snackbar", Snackbar.Msg]
  | ["GameRoom", GameRoom.FrontendMsg]
  | ["Store", Store.Msg]
  | ["Auth", Auth.Msg]
  | ["Page", Page.Msg]

export type BackendMsg =
  | ["[Frontend]", ClientId.ClientId, ToBackend]
  | ["ClientConnected", ClientId.ClientId]
  | ["ClientDisconnected", ClientId.ClientId]
  | ["GameRoom", GameRoom.BackendMsg]

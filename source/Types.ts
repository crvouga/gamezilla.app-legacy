import * as Auth from "./Auth"
import * as Connection from "./Connection"
import { ClientId } from "./Data"
import * as GameRoom from "./GameRoom"
import * as Pages from "./Pages"
import * as Route from "./Route"
import * as Snackbar from "./Snackbar"
import * as Store from "./Store"

//
//
//
//
// Model
//
//
//
//

export type FrontendModel = {
  snackbar: Snackbar.Model
  store: Store.Model
  auth: Auth.Model
  page: Pages.Model
  route: Route.Route
  connection: Connection.Model
  gameRoom: GameRoom.FrontendModel
}

export type BackendModel = {
  gameRoom: GameRoom.BackendModel
}

//
//
//
//
// Msg
//
//
//
//

export type FrontendMsg =
  | ["BackendToFrontend", ToFrontend]
  | ["Route", Route.Msg]
  | ["Snackbar", Snackbar.Msg]
  | ["GameRoom", GameRoom.FrontendMsg]
  | ["Store", Store.Msg]
  | ["Auth", Auth.Msg]
  | ["Page", Pages.Msg]
  | ["Connection", Connection.Msg]

export type ToBackend = ["GameRoom", GameRoom.ToBackend]

export type BackendMsg =
  | ["FrontendToBackend", ClientId.ClientId, ToBackend]
  | ["GameRoom", GameRoom.BackendMsg]
  | ["ClientConnected", ClientId.ClientId]
  | ["ClientDisconnected", ClientId.ClientId]

export type ToFrontend = ["GameRoom", GameRoom.ToFrontend]

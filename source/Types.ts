import * as Auth from "./Auth"
import * as Connection from "./Connection"
import { Option } from "./Core"
import * as Games from "./Games"
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
  games: Games.FrontendModel
}

export type BackendModel = {
  games: Games.BackendModel
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
  | ["ToFrontend", ToFrontend]
  | ["Route", Route.Msg]
  | ["Snackbar", Snackbar.Msg]
  | ["Games", Games.FrontendMsg]
  | ["Store", Store.Msg]
  | ["Auth", Auth.Msg]
  | ["Page", Pages.Msg]
  | ["Connection", Connection.Msg]

export type ToBackend = ["Games", Games.ToBackend]

export type BackendMsg =
  | ["ToBackend", string, ToBackend]
  | ["Games", Games.BackendMsg]
  | ["ClientConnected", string]
  | ["ClientDisconnected", string]

export type ToFrontend = ["Games", Games.ToFrontend]

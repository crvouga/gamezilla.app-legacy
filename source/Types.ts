import * as Auth from "./Auth"
import * as Connection from "./Connection"
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
  game: Games.FrontendModel
}

export type BackendModel = {
  games: Games.BackendModel
  clients: {
    [clientId: string]: {
      clientId:string,
      userId: string
    }
  }
  users: {
    [userId: string]: {
      userId: string
      roomId: string
    }
  }
  rooms: {
    [roomId: string]: {}
  }
}

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["ToFrontend", ToFrontend]
  | ["Route", Route.Msg]
  | ["Snackbar", Snackbar.Msg]
  | ["Game", Games.FrontendMsg]
  | ["Store", Store.Msg]
  | ["Auth", Auth.Msg]
  | ["Page", Pages.Msg]
  | ["Connection", Connection.Msg]

export type ToBackend = ["Games", Games.ToBackend]

export type BackendMsg =
  | ["ToBackend", string, ToBackend]
  | ["Games", Games.BackendMsg]

export type ToFrontend = ["Games", Games.ToFrontend]

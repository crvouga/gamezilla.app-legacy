import * as Admin from "./Admin";
import * as Auth from "./Auth";
import * as Clients from "./Clients";
import * as ConnectionStatus from "./ConnectionStatus";
import * as Counter from "./Counter";
import * as Games from "./Games";
import * as Pages from "./Pages";
import * as Route from "./Route";
import * as Snackbar from "./Snackbar";
import * as Store from "./Store";

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
  snackbar: Snackbar.Model;
  store: Store.Model;
  auth: Auth.Model;
  page: Pages.Model;
  route: Route.Route;
  connectionStatus: ConnectionStatus.Model;
  game: Games.FrontendModel;
  counter: Counter.FrontendModel;
  admin: Admin.FrontendModel;
};

export type BackendModel = {
  clients: Clients.Model;
  counter: Counter.BackendModel;
  games: Games.BackendModel;
};

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["Route", Route.Msg]
  | ["Snackbar", Snackbar.Msg]
  | ["Game", Games.FrontendMsg]
  | ["Store", Store.Msg]
  | ["Auth", Auth.Msg]
  | ["Page", Pages.Msg]
  | ["ConnectionStatus", ConnectionStatus.Msg]
  | ["Counter", Counter.FrontendMsg]
  | ["Admin", Admin.FrontendMsg]
  | ["ToFrontend", ToFrontend];

export type ToBackend =
  | ["Counter", Counter.ToBackend]
  | ["Games", Games.ToBackend];

export type BackendMsg =
  | ["Clients", Clients.Msg]
  | ["Counter", Counter.BackendMsg]
  | ["ToBackend", string, ToBackend]
  | ["Games", Games.BackendMsg];

export type ToFrontend =
  | ["Counter", Counter.ToFrontend]
  | ["Games", Games.ToFrontend]
  | ["Admin", Admin.ToFrontend];

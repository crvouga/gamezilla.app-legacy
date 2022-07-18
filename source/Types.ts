import * as Admin from "./Admin";
import * as Clients from "./Clients";
import * as ConnectionStatus from "./ConnectionStatus";
import * as Counter from "./Counter";
import * as Games from "./Games";
import * as Pages from "./Pages";
import * as Route from "./Route";
import * as Session from "./Session";
import * as Snackbar from "./Snackbar";
import * as Store from "./Store";
import { RemoteData } from "./Core";

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
  session: Session.Model;
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
  | ["Session", Session.Msg]
  | ["Page", Pages.Msg]
  | ["ConnectionStatus", ConnectionStatus.Msg]
  | ["Counter", Counter.FrontendMsg]
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

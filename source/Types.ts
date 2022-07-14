import * as Clients from "Clients";
import * as ConnectionStatus from "ConnectionStatus";
import * as Counter from "Counter";
import * as Games from "Games";
import * as Pages from "Pages";
import * as Route from "Route";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import * as Store from "Store";

export type FrontendModel = {
  snackbar: Snackbar.Model;
  store: Store.Model;
  session: Session.Model;
  game: Games.Model;
  page: Pages.Model;
  route: Route.Route;
  connectionStatus: ConnectionStatus.Model;
  counter: Counter.FrontendModel;
};

export type BackendModel = {
  clients: Clients.Model;
  counter: Counter.BackendModel;
};

export type FrontendMsg =
  | ["Route", Route.Msg]
  | ["Snackbar", Snackbar.Msg]
  | ["Game", Games.Msg]
  | ["Store", Store.Msg]
  | ["Session", Session.Msg]
  | ["Page", Pages.Msg]
  | ["ConnectionStatus", ConnectionStatus.Msg]
  | ["Counter", Counter.FrontendMsg]
  | ["FromBackend", ToFrontend];

export type ToBackend = ["Counter", Counter.ToBackend];

export type BackendMsg =
  | ["Clients", Clients.Msg]
  | ["Counter", Counter.BackendMsg]
  | ["FromFrontend", string, ToBackend];

export type ToFrontend = ["Counter", Counter.ToFrontend];

import * as Clients from "Clients";
import * as Connection from "Connection";
import * as Counter from "Counter";
import * as Games from "Games";
import * as Pages from "Pages";
import * as Route from "Route";
import * as Session from "Session";
import * as Snackbar from "Snackbar";
import * as Store from "Store";
import { Fullstack } from "Core";

export type FrontendModel = {
  snackbar: Snackbar.Model;
  store: Store.Model;
  session: Session.Model;
  game: Games.Model;
  page: Pages.Model;
  route: Route.Route;
  connection: Connection.Model;
  counter: Counter.FrontendModel;
};

export type BackendModel = {
  clients: Clients.Model;
  counter: Counter.BackendModel;
};

export type FrontendMsg =
  | Route.Msg
  | Snackbar.Msg
  | Games.Msg
  | Store.Msg
  | Session.Msg
  | Pages.Msg
  | Connection.Msg
  | Counter.FrontendMsg;

export type ToBackend = Counter.ToBackend;

export type BackendMsg = Clients.Msg | Counter.BackendMsg;

export type ToFrontend = Counter.ToFrontend;

//
//
//
// Bridge
//
//
//

export const sendToFrontend = (clientId: string, msg: ToFrontend) => {
  return Fullstack.unsafe_sendToFrontend(clientId, msg);
};

export const broadcast = (msg: ToFrontend) => {
  return Fullstack.unsafe_broadcast(msg);
};

export const sendToBackend = (msg: ToBackend) => {
  return Fullstack.unsafe_sendToBackend(msg);
};

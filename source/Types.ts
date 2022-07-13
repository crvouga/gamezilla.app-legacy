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
  socket: Fullstack.FrontendSocket;
  counter: Counter.FrontendModel;
};

export type BackendModel = {
  clients: { [userId: string]: string };
  counter: Counter.BackendModel;
};

export type FrontendMsg =
  | Route.Msg
  | Snackbar.GroupedMsg
  | Games.GroupedMsg
  | Store.GroupedMsg
  | Session.Msg
  | Pages.GroupedMsg
  | Counter.FrontendMsg
  | {
      group: "Socket";
      type: "SocketChanged";
      socket: Fullstack.FrontendSocket;
    };

export type ToBackend = Counter.ToBackend;

export type BackendMsg = Counter.BackendMsg;

export type ToFrontend = Counter.ToFrontend;

//
//
//
// Bridge
//
//
//

export const sendToFrontend = (clientId: string, msg: ToFrontend) => {
  return Fullstack.unsafe_sendToFrontend<ToFrontend>(clientId, msg);
};

export const broadcast = (msg: ToFrontend) => {
  return Fullstack.unsafe_broadcast<ToFrontend>(msg);
};

export const sendToBackend = (msg: ToBackend) => {
  return Fullstack.unsafe_sendToBackend<ToBackend>(msg);
};

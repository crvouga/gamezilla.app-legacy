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
  counter?: Counter;
};

export type Counter = {
  count: number;
  status: "Incrementing" | "Idle";
};

export type BackendModel = {
  clients: { [userId: string]: string };
  counter: Counter;
};

export type FrontendMsg =
  | Route.Msg
  | Snackbar.GroupedMsg
  | Games.GroupedMsg
  | Store.GroupedMsg
  | Session.Msg
  | Pages.GroupedMsg
  | { group: "Counter"; type: "ClickedToggle" };

export type ToBackend = {
  type: "Toggle";
};

export type BackendMsg =
  | { type: "ClientConnected"; clientId: string }
  | { type: "ClientDisconnected"; clientId: string }
  | { type: "TimeElapsed" };

export type ToFrontend = {
  type: "GotCounter";
  counter: Counter;
};

//
//
//
// Bridge
//
//
//

export const sendToFrontend = (clientId: string, msg: ToFrontend) => {
  return Fullstack.sendToFrontend<ToFrontend>(clientId, msg);
};

export const broadcast = (msg: ToFrontend) => {
  return Fullstack.broadcast<ToFrontend>(msg);
};

export const sendToBackend = (msg: ToBackend) => {
  return Fullstack.sendToBackend<ToBackend>(msg);
};

import { ClientId, ServerWireMsg, SessionId } from "src/core";
import * as Auth from "src/feat/auth";
import * as Chat from "src/feat/chat";
import * as Space from "src/feat/space";
import * as Profile from "src/feat/profile";
import * as Search from "src/feat/search";
import { Routing, Toast, Wire } from "./app-client";

//
//
//
// Model
//
//
//

export type ServerModel = {
  space: Space.ServerModel;
  sessions: {
    [sessionId: SessionId]: Session;
  };
  profile: Profile.ServerModel;
  search: Search.ServerModel;
  chat: Chat.ServerModel;
  auth: Auth.ServerModel;
};

export type Session = {
  sessionId: SessionId;
  clientIds: ClientId[];
};

export type ClientModel = {
  auth: Auth.ClientModel;
  space: Space.ClientModel;
  profile: Profile.ClientModel;
  chat: Chat.ClientModel;
  search: Search.ClientModel;
  //
  routing: Routing.Model;
  toast: Toast.Model;
  wire: Wire.Model;
};

//
//
//
// Msg
//
//
//

export type ToServer =
  | { t: "game-space"; c: Space.ToServer }
  | { t: "auth"; c: Auth.ToServer }
  | { t: "profile"; c: Profile.ToServer }
  | { t: "search"; c: Search.ToServer }
  | { t: "chat"; c: Chat.ToServer }
  | { t: "auth"; c: Auth.ToServer };

export type ToClient =
  | { t: "game-space"; c: Space.ToClient }
  | { t: "profile"; c: Profile.ToClient }
  | { t: "search"; c: Search.ToClient }
  | { t: "chat"; c: Chat.ToClient }
  | { t: "auth"; c: Auth.ToClient }
  | { t: "access-denied"; msg: ToServer };

export type ClientMsg =
  | { t: "▶"; c: ToClient }
  //
  | { t: "wire"; c: Wire.Msg }
  | { t: "routing"; c: Routing.Msg }
  | { t: "toast"; c: Toast.Msg }
  //
  | { t: "game-space"; c: Space.ClientMsg }
  | { t: "chat"; c: Chat.ClientMsg }
  | { t: "auth"; c: Auth.ClientMsg }
  | { t: "profile"; c: Profile.ClientMsg }
  | { t: "search"; c: Search.ClientMsg };

export type ServerMsg =
  | { t: "▶"; sessionId: SessionId; clientId: ClientId; c: ToServer }
  | { t: "wire"; c: ServerWireMsg }
  | { t: "game-space"; c: Space.ServerMsg }
  | { t: "profile"; c: Profile.ServerMsg }
  | { t: "search"; c: Search.ServerMsg }
  | { t: "chat"; c: Chat.ServerMsg }
  | { t: "auth"; c: Auth.ServerMsg };

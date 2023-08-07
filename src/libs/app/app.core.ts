import { ClientId, SessionId } from "@gamezilla/core";
import * as Auth from "@gamezilla/feat/auth";
import * as Chat from "@gamezilla/feat/chat";
import * as GameSpace from "@gamezilla/feat/game-space";
import * as Profile from "@gamezilla/feat/profile";
import * as Search from "@gamezilla/feat/search";
import { Routing, Toast, Wire } from "./app-client";

//
//
//
// Model
//
//
//

export type ServerModel = {
  space: GameSpace.ServerModel;
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
  gameSpace: GameSpace.ClientModel;
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
  | { t: "game-space"; c: GameSpace.ToServer }
  | { t: "auth"; c: Auth.ToServer }
  | { t: "profile"; c: Profile.ToServer }
  | { t: "search"; c: Search.ToServer }
  | { t: "chat"; c: Chat.ToServer }
  | { t: "auth"; c: Auth.ToServer };

export type ToClient =
  | { t: "game-space"; c: GameSpace.ToClient }
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
  | { t: "game-space"; c: GameSpace.ClientMsg }
  | { t: "chat"; c: Chat.ClientMsg }
  | { t: "auth"; c: Auth.ClientMsg }
  | { t: "profile"; c: Profile.ClientMsg }
  | { t: "search"; c: Search.ClientMsg };

export type ServerMsg =
  | { t: "▶"; sessionId: SessionId; clientId: ClientId; c: ToServer }
  | { t: "client-connected"; sessionId: SessionId; clientId: ClientId }
  | { t: "client-disconnected"; sessionId: SessionId; clientId: ClientId }
  | { t: "game-space"; c: GameSpace.ServerMsg }
  | { t: "profile"; c: Profile.ServerMsg }
  | { t: "search"; c: Search.ServerMsg }
  | { t: "chat"; c: Chat.ServerMsg }
  | { t: "auth"; c: Auth.ServerMsg };

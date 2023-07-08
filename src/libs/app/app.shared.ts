import * as Auth from "@gamezilla/feat/auth";
import * as Chat from "@gamezilla/feat/chat";
import * as Profile from "@gamezilla/feat/profile";
import * as Search from "@gamezilla/feat/search";
import * as Space from "@gamezilla/feat/space";
import { ClientId, SessionId } from "@gamezilla/shared/app";
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
  routing: Routing.Model;
  toast: Toast.Model;
  wire: Wire.Model;
  //
  auth: Auth.ClientModel;
  space: Space.ClientModel;
  profile: Profile.ClientModel;
  chat: Chat.ClientModel;
  search: Search.ClientModel;
};

//
//
//
// Msg
//
//
//

export type ToServer =
  | { t: "space"; c: Space.ToServer }
  | { t: "auth"; c: Auth.ToServer }
  | { t: "profile"; c: Profile.ToServer }
  | { t: "search"; c: Search.ToServer }
  | { t: "chat"; c: Chat.ToServer }
  | { t: "auth"; c: Auth.ToServer };

export type ToClient =
  | { t: "space"; c: Space.ToClient }
  | { t: "profile"; c: Profile.ToClient }
  | { t: "search"; c: Search.ToClient }
  | { t: "chat"; c: Chat.ToClient }
  | { t: "auth"; c: Auth.ToClient }
  | { t: "access-denied"; msg: ToServer };

export type ClientMsg =
  | { t: "→"; c: ToClient }
  //
  | { t: "wire"; c: Wire.Msg }
  | { t: "routing"; c: Routing.Msg }
  | { t: "toast"; c: Toast.Msg }
  //
  | { t: "space"; c: Space.ClientMsg }
  | { t: "chat"; c: Chat.ClientMsg }
  | { t: "auth"; c: Auth.ClientMsg }
  | { t: "profile"; c: Profile.ClientMsg }
  | { t: "search"; c: Search.ClientMsg };

export type ServerMsg =
  | { t: "→"; sessionId: SessionId; clientId: ClientId; c: ToServer }
  | { t: "client-connected"; sessionId: SessionId; clientId: ClientId }
  | { t: "client-disconnected"; sessionId: SessionId; clientId: ClientId }
  | { t: "space"; c: Space.ServerMsg }
  | { t: "profile"; c: Profile.ServerMsg }
  | { t: "search"; c: Search.ServerMsg }
  | { t: "chat"; c: Chat.ServerMsg }
  | { t: "auth"; c: Auth.ServerMsg };

//
//
//
// Transport
//
//
//

export type ServerToClientEvents = {
  ["to-client"]: (msg: ToClient) => void;
  ["session-id"]: (sessionId: SessionId) => void;
};

export type ClientToServerEvents = {
  ["to-server"]: (msg: ToServer) => void;
};

export const serverPort = 5000;

export const sessionIdKey = "gamezilla_session_id";

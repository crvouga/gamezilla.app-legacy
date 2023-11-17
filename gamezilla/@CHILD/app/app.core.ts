import { Routing, Toast, Wire, Sound } from "./app-client";
import * as Auth from "./@CHILD/auth/auth.core";
import * as Chat from "./@CHILD/chat/chat.core";
import * as Profile from "./@CHILD/profile/profile.core";
import * as Search from "./@CHILD/search/search.core";
import * as Space from "./@CHILD/space/space.core";
import { ClientId, SessionId } from "./@SHARED/data";
import { ServerWireMsg } from "./wire";

export type ServerModel = {
  sessions: {
    [sessionId: SessionId]: WireSession;
  };
  space: Space.ServerModel;
  profile: Profile.ServerModel;
  search: Search.ServerModel;
  chat: Chat.ServerModel;
  auth: Auth.ServerModel;
};

export type WireSession = {
  sessionId: SessionId;
  clientId?: ClientId;
};

export type ClientModel = {
  auth: Auth.ClientModel;
  space: Space.ClientModel;
  profile: Profile.ClientModel;
  chat: Chat.ClientModel;
  search: Search.ClientModel;
  //
  routing: Routing.ClientModel;
  toast: Toast.Model;
  wire: Wire.Model;
  sound: Sound.Model;
  //
  documentVisibilityState: DocumentVisibilityState;
};

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
  | { t: "➡️"; c: ToClient }
  //
  | { t: "wire"; c: Wire.Msg }
  | { t: "routing"; c: Routing.Msg }
  | { t: "toast"; c: Toast.Msg }
  | { t: "sound"; c: Sound.Msg }
  //
  | { t: "document-visibility-changed"; state: DocumentVisibilityState }
  //
  | { t: "space"; c: Space.ClientMsg }
  | { t: "chat"; c: Chat.ClientMsg }
  | { t: "auth"; c: Auth.ClientMsg }
  | { t: "profile"; c: Profile.ClientMsg }
  | { t: "search"; c: Search.ClientMsg };

export type ServerMsg =
  | {
      t: "➡️";
      sessionId: SessionId;
      clientId: ClientId;
      c: ToServer;
    }
  | { t: "wire"; c: ServerWireMsg }
  | { t: "space"; c: Space.ServerMsg }
  | { t: "profile"; c: Profile.ServerMsg }
  | { t: "search"; c: Search.ServerMsg }
  | { t: "chat"; c: Chat.ServerMsg }
  | { t: "auth"; c: Auth.ServerMsg };

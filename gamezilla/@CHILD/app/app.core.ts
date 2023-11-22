import * as Auth from "./@CHILD/auth/auth.core";
import * as Chat from "./@CHILD/chat/chat.core";
import * as Profile from "./@CHILD/profile/profile.core";
import * as Search from "./@CHILD/search/search.core";
import * as Space from "./@CHILD/space/space.core";
import * as Wire from "./@CHILD/wire/wire.core";
import { ClientId, SessionId } from "./@SHARED/data";
import { Platform, Routing, Sound, Toast } from "./app-client";

//
//
//
// Model
//
//
//

export type ServerModel = {
  wire: Wire.ServerModel;
  space: Space.ServerModel;
  profile: Profile.ServerModel;
  search: Search.ServerModel;
  chat: Chat.ServerModel;
  auth: Auth.ServerModel;
};

export type ClientModel = {
  auth: Auth.ClientModel;
  space: Space.ClientModel;
  profile: Profile.ClientModel;
  chat: Chat.ClientModel;
  search: Search.ClientModel;
  wire: Wire.ClientModel;
  routing: Routing.Model;
  toast: Toast.Model;
  sound: Sound.Model;
  platform: Platform.Model;
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
  | { t: "auth"; c: Auth.ToServer }
  | { t: "wire"; c: Wire.ToServer };

export type ToClient =
  | { t: "space"; c: Space.ToClient }
  | { t: "profile"; c: Profile.ToClient }
  | { t: "search"; c: Search.ToClient }
  | { t: "chat"; c: Chat.ToClient }
  | { t: "auth"; c: Auth.ToClient }
  | { t: "wire"; c: Wire.ToClient };

export type ClientMsg =
  | { t: "➡️"; c: ToClient }
  | { t: "routing"; c: Routing.Msg }
  | { t: "toast"; c: Toast.Msg }
  | { t: "sound"; c: Sound.Msg }
  | { t: "platform"; c: Platform.Msg }
  | { t: "wire"; c: Wire.ClientMsg }
  | { t: "space"; c: Space.ClientMsg }
  | { t: "chat"; c: Chat.ClientMsg }
  | { t: "auth"; c: Auth.ClientMsg }
  | { t: "profile"; c: Profile.ClientMsg }
  | { t: "search"; c: Search.ClientMsg };

export type ServerMsg =
  | { t: "➡️"; sessionId: SessionId; clientId: ClientId; c: ToServer }
  | { t: "wire"; c: Wire.ServerMsg }
  | { t: "space"; c: Space.ServerMsg }
  | { t: "profile"; c: Profile.ServerMsg }
  | { t: "search"; c: Search.ServerMsg }
  | { t: "chat"; c: Chat.ServerMsg }
  | { t: "auth"; c: Auth.ServerMsg };

//
//
//
//
// Config
//
//
//
//

const IS_PROD = process.env.NODE_ENV === "production";
const SERVER_PORT_LOCAL = 5000;
const SERVER_URL_LOCAL = "http://localhost:5000/";
const SERVER_URL_NGROK = "https://gamezilla-server.ngrok.io/";
const SERVER_URL_PROD = "https://server.gamezilla.app/";
const WEB_SOCKETS_ENDPOINT = "/ws";
const USE_NGROK = true;

const SERVER_URL = IS_PROD
  ? SERVER_URL_PROD
  : USE_NGROK
  ? SERVER_URL_NGROK
  : SERVER_URL_LOCAL;

const SERVER_PORT = Number(process.env.PORT ?? SERVER_PORT_LOCAL);

if (!SERVER_URL) {
  throw new Error("SERVER_URL not set");
}

export const APP_CONFIG = {
  SERVER_URL,
  SERVER_PORT,
  WEB_SOCKETS_ENDPOINT,
};

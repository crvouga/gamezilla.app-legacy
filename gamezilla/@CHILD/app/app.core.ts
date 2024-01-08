import * as Auth from "./@CHILD/auth/auth.core";
import * as Profile from "./@CHILD/profile/profile.core";
import * as Space from "./@CHILD/spaces/spaces.core";
import * as Wire from "./@CHILD/wire/wire.core";
import { ClientId, SessionId } from "./@SHARED/data";
import { Platform, Routing, Sound, StatusBar, Toast } from "./app-client";
import config from "config.json";

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
  auth: Auth.ServerModel;
};

export type ClientModel = {
  auth: Auth.ClientModel;
  space: Space.ClientModel;
  profile: Profile.ClientModel;
  wire: Wire.ClientModel;
  routing: Routing.Model;
  toast: Toast.Model;
  sound: Sound.Model;
  platform: Platform.Model;
  statusBar: StatusBar.Model;
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
  | { t: "auth"; c: Auth.ToServer }
  | { t: "wire"; c: Wire.ToServer };

export type ToClient =
  | { t: "space"; c: Space.ToClient }
  | { t: "profile"; c: Profile.ToClient }
  | { t: "auth"; c: Auth.ToClient }
  | { t: "wire"; c: Wire.ToClient };

export type ClientMsg =
  | { t: "➡️"; c: ToClient }
  | { t: "routing"; c: Routing.Msg }
  | { t: "toast"; c: Toast.Msg }
  | { t: "sound"; c: Sound.Msg }
  | { t: "platform"; c: Platform.Msg }
  | { t: "status-bar"; c: StatusBar.Msg }
  | { t: "wire"; c: Wire.ClientMsg }
  | { t: "space"; c: Space.ClientMsg }
  | { t: "auth"; c: Auth.ClientMsg }
  | { t: "profile"; c: Profile.ClientMsg };

export type ServerMsg =
  | ({ t: "➡️"; c: ToServer } & ToServerMeta)
  | { t: "wire"; c: Wire.ServerMsg }
  | { t: "space"; c: Space.ServerMsg }
  | { t: "profile"; c: Profile.ServerMsg }
  | { t: "auth"; c: Auth.ServerMsg };

//
//
//

export type ToServerMeta = { sessionId: SessionId; clientId: ClientId };

//
//
//
//
// Config
//
//
//
//

const IS_PROD = process.env["NODE_ENV"] === "production";
const SERVER_PORT_LOCAL = 5002;
const SERVER_URL_LOCAL = `http://localhost:${SERVER_PORT_LOCAL}/`;
const SERVER_URL_NGROK = "https://gamezilla-server.ngrok.io/";
const SERVER_URL_PROD = "https://server.gamezilla.app/";
const WEB_SOCKETS_ENDPOINT = "/ws";
const USE_NGROK = false;

const SERVER_URL = IS_PROD
  ? SERVER_URL_PROD
  : USE_NGROK
  ? SERVER_URL_NGROK
  : SERVER_URL_LOCAL;

const SERVER_PORT = Number(process.env["PORT"] ?? SERVER_PORT_LOCAL);

if (!SERVER_URL) {
  throw new Error("SERVER_URL not set");
}

const CODEBASE_VERSION_ID = config["codebase_version_id"];

if (!CODEBASE_VERSION_ID) {
  throw new Error("CODEBASE_VERSION_ID not set");
}

export const PUBLIC_APP_CONFIG = {
  SERVER_URL,
  SERVER_PORT,
  WEB_SOCKETS_ENDPOINT,
  CODEBASE_VERSION_ID,
};

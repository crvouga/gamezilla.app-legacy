import * as Auth from "./@CHILD/auth/auth.core";
import * as Profile from "./@CHILD/profile/profile.core";
import * as Spaces from "./@CHILD/spaces/spaces.core";
import * as Wire from "./@CHILD/wire/wire.core";
import { ClientCmd, ClientEvent } from "./@SHARED/client";
import { ClientId, SessionId } from "./@SHARED/data";
import { Platform, Routing, Sound, StatusBar, Toast } from "./app-client";

//
//
//
// Model
//
//
//

export type ServerModel = {
  wire: Wire.ServerModel;
  spaces: Spaces.ServerModel;
  profile: Profile.ServerModel;
  auth: Auth.ServerModel;
};

export type ClientModel = {
  auth: Auth.ClientModel;
  spaces: Spaces.ClientModel;
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

export type ServerMsg =
  | ({ t: "➡️"; c: ToServer } & ToServerMeta)
  | { t: "wire"; c: Wire.ServerMsg }
  | { t: "spaces"; c: Spaces.ServerMsg }
  | { t: "profile"; c: Profile.ServerMsg }
  | { t: "auth"; c: Auth.ServerMsg };

export type ClientMsg =
  | { t: "➡️"; c: ToClient }
  | { t: "routing"; c: Routing.Msg }
  | { t: "toast"; c: Toast.Msg }
  | { t: "sound"; c: Sound.Msg }
  | { t: "platform"; c: Platform.Msg }
  | { t: "status-bar"; c: StatusBar.Msg }
  | { t: "wire"; c: Wire.ClientMsg }
  | { t: "spaces"; c: Spaces.ClientMsg }
  | { t: "auth"; c: Auth.ClientMsg }
  | { t: "profile"; c: Profile.ClientMsg };

export type ToServer =
  | { t: "spaces"; c: Spaces.ToServer }
  | { t: "auth"; c: Auth.ToServer }
  | { t: "profile"; c: Profile.ToServer }
  | { t: "wire"; c: Wire.ToServer };

export type ToClient =
  | { t: "spaces"; c: Spaces.ToClient }
  | { t: "auth"; c: Auth.ToClient }
  | { t: "profile"; c: Profile.ToClient }
  | { t: "wire"; c: Wire.ToClient };

//
//
//
//

export type ClientMsgFinal =
  | { t: "msg"; msg: ClientMsg }
  | { t: "event"; event: ClientEvent }
  | { t: "from-server"; fromServer: ClientMsg }
  | { t: "cmd"; cmd: ClientCmd<{ ClientMsg: ClientMsg; ToServer: ToServer }> };

//
//
//

export type ToServerMeta = { sessionId: SessionId; clientId: ClientId };

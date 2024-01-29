import * as Auth from "./@CHILD/auth/auth.core";
import * as Profile from "./@CHILD/profile/profile.core";
import * as Spaces from "./@CHILD/spaces/spaces.core";
import * as Wire from "./@CHILD/wire/wire.core";
import { ClientCmd, ClientEvent } from "./@SHARED/client";
import { ClientId, SessionId, UserId } from "./@SHARED/data";
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
  | ({ t: "➡️"; c: MsgToServer } & MsgToServerMeta)
  | { t: "wire"; c: Wire.ServerMsg }
  | { t: "spaces"; c: Spaces.ServerMsg }
  | { t: "profile"; c: Profile.ServerMsg }
  | { t: "auth"; c: Auth.ServerMsg };

export type ClientMsg =
  | { t: "➡️"; c: MsgToClient }
  | { t: "routing"; c: Routing.Msg }
  | { t: "toast"; c: Toast.Msg }
  | { t: "sound"; c: Sound.Msg }
  | { t: "platform"; c: Platform.Msg }
  | { t: "status-bar"; c: StatusBar.Msg }
  | { t: "wire"; c: Wire.ClientMsg }
  | { t: "spaces"; c: Spaces.ClientMsg }
  | { t: "auth"; c: Auth.ClientMsg }
  | { t: "profile"; c: Profile.ClientMsg };

export type MsgToServer =
  | { t: "spaces"; c: Spaces.MsgToServer }
  | { t: "auth"; c: Auth.MsgToServer }
  | { t: "profile"; c: Profile.MsgToServer }
  | { t: "wire"; c: Wire.MsgToServer };

export type MsgToClient =
  | { t: "spaces"; c: Spaces.MsgToClient }
  | { t: "auth"; c: Auth.MsgToClient }
  | { t: "profile"; c: Profile.MsgToClient }
  | { t: "wire"; c: Wire.MsgToClient };

//
//
//
//

export type ClientMsgFinal =
  | { t: "msg"; msg: ClientMsg }
  | { t: "msgEvt"; msgEvt: ClientEvent }
  | { t: "from-server"; msgServer: ClientMsg }
  | {
      t: "msgCmd";
      msgCmd: ClientCmd<{ ClientMsg: ClientMsg; MsgToServer: MsgToServer }>;
    };

//
//
//

export type MsgToServerMeta = {
  sessionId: SessionId;
  clientId: ClientId;
  userId?: UserId | null;
};

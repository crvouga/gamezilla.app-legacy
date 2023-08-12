import { Result } from "gamezilla/@SHARED/core";
import * as VsBot from "./vs-bot/vs-bot.core";
import * as VsUser from "./vs-user/vs-user.core";

//
//
//
// Model
//
//
//

export type ClientModel =
  | { t: "none" }
  | { t: "vs-user"; c: VsUser.ClientModel }
  | { t: "vs-bot"; c: VsBot.ClientModel };

export type ServerModel =
  | { t: "none" }
  | { t: "vs-user"; c: VsUser.ServerModel }
  | { t: "vs-bot"; c: VsBot.ServerModel };

export type Mode = ServerModel["t"];

//
//
//
// Msg
//
//
//

export type ClientMsg =
  | { t: "vs-user"; c: VsUser.ClientMsg }
  | { t: "vs-bot"; c: VsBot.ClientMsg }
  | Req;

export type ServerMsg =
  | { t: "vs-user"; c: VsUser.ServerMsg }
  | { t: "vs-bot"; c: VsBot.ServerMsg };

export type ToClient =
  | { t: "vs-user"; c: VsUser.ToClient }
  | { t: "vs-bot"; c: VsBot.ToClient }
  | Res;

export type ToServer =
  | { t: "vs-user"; c: VsUser.ToServer }
  | { t: "vs-bot"; c: VsBot.ToServer }
  | Req;

//
//
//
//
//

export type Req = { t: "input-mode"; mode: Mode };
export type Res = Req & { result: Result<string, ServerModel> };

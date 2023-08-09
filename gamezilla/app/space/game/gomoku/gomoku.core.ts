import { Result } from "gamezilla/@/core";
import { UserId } from "gamezilla/app/@/app";
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
  | {
      t: "none";
    }
  | {
      t: "vs-user";
      c: VsUser.ClientModel;
    }
  | {
      t: "vs-bot";
      c: VsBot.ClientModel;
    };

export type ServerModel =
  | {
      t: "none";
    }
  | {
      t: "vs-user";
      c: VsUser.ServerModel;
    }
  | {
      t: "vs-bot";
      c: VsBot.ServerModel;
    };

export type Mode = ServerModel["t"];

//
//
//
// Msg
//
//
//

export type ClientMsg =
  | Req
  | { t: "vs-user"; c: VsUser.ClientMsg }
  | { t: "vs-bot"; c: VsBot.ClientMsg };

export type ServerMsg =
  | { t: "vs-user"; c: VsUser.ServerMsg }
  | { t: "vs-bot"; c: VsBot.ServerMsg };

export type ToClient =
  | Res
  | { t: "vs-user"; c: VsUser.ToClient }
  | { t: "vs-bot"; c: VsBot.ToClient };

export type ToServer =
  | Req
  | { t: "vs-user"; c: VsUser.ToServer }
  | { t: "vs-bot"; c: VsBot.ToServer };

export type Req = { t: "input-mode"; userId: UserId; mode: Mode };

export type Res = Req & {
  result: Result<Problem, ServerModel>;
};

export type Problem = "must-be-host";

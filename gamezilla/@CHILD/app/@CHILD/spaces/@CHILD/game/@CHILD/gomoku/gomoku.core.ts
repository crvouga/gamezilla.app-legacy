import { Result } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import * as VsBot from "./@CHILD/vs-bot/vs-bot.core";
import * as VsUser from "./@CHILD/vs-user/vs-user.core";

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

export type MsgClient =
  | Req
  | { t: "vs-user"; c: VsUser.MsgClient }
  | { t: "vs-bot"; c: VsBot.MsgClient };

export type MsgServer =
  | { t: "vs-user"; c: VsUser.MsgServer }
  | { t: "vs-bot"; c: VsBot.MsgServer };

export type MsgToClient =
  | Res
  | { t: "vs-user"; c: VsUser.MsgToClient }
  | { t: "vs-bot"; c: VsBot.MsgToClient };

export type MsgToServer =
  | Req
  | { t: "vs-user"; c: VsUser.MsgToServer }
  | { t: "vs-bot"; c: VsBot.MsgToServer };

export type Req = { t: "input-mode"; userId: UserId; mode: Mode };

export type Res = Req & {
  result: Result<Problem, ServerModel>;
};

export type Problem = "must-be-host";

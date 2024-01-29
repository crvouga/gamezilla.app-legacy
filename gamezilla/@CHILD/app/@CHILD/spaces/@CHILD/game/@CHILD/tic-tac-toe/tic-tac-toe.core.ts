import { err, Result } from "gamezilla/@SHARED/core";
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
  | { t: "none" }
  | { t: "vs-user"; c: VsUser.ClientModel }
  | { t: "vs-bot"; c: VsBot.ClientModel };

export type ServerModel =
  | { t: "none" }
  | { t: "vs-user"; c: VsUser.ServerModel }
  | { t: "vs-bot"; c: VsBot.ServerModel };

export const parseModel = (): Result<string, ServerModel> => {
  return err("Unimplemented");
};

//
//
//
// Msg
//
//
//

export type MsgClient =
  | { t: "vs-user"; c: VsUser.MsgClient }
  | { t: "vs-bot"; c: VsBot.MsgClient }
  | Req;

export type MsgServer =
  | { t: "vs-user"; c: VsUser.MsgServer }
  | { t: "vs-bot"; c: VsBot.MsgServer };

export type MsgToServer =
  | { t: "vs-user"; c: VsUser.MsgToServer }
  | { t: "vs-bot"; c: VsBot.MsgToServer }
  | Req;

export type MsgToClient =
  | { t: "vs-user"; c: VsUser.MsgToClient }
  | { t: "vs-bot"; c: VsBot.MsgToClient }
  | Res;

export type Req = {
  t: "input-mode";
  mode: ServerModel["t"];
};

export type Res = Req & {
  result: Result<Problem, ServerModel>;
};

type Problem = "must-be-host";

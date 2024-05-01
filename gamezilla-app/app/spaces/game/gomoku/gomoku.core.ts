import type { Result } from "gamezilla-app/@/core";
import type { UserId } from "gamezilla-app/app/@/data";
import type * as VsBot from "./vs-bot/vs-bot.core";
import type * as VsUser from "./vs-user/vs-user.core";

//
//
//
// Model
//
//
//

export type ModelClient =
	| {
			t: "none";
	  }
	| {
			t: "vs-user";
			c: VsUser.ModelClient;
	  }
	| {
			t: "vs-bot";
			c: VsBot.ModelClient;
	  };

export type ModelServer =
	| {
			t: "none";
	  }
	| {
			t: "vs-user";
			c: VsUser.ModelServer;
	  }
	| {
			t: "vs-bot";
			c: VsBot.ModelServer;
	  };

export type Mode = ModelServer["t"];

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
	result: Result<Problem, ModelServer>;
};

export type Problem = "must-be-host";

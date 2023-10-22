import { Result } from "gamezilla/@SHARED/core";
import * as VsBot from "./vs-bot/vs-bot.core";
import * as VsUser from "./vs-user/vs-user.core";
import { UserId } from "gamezilla/app/@SHARED/data";
import { SpaceCtx } from "../../@SHARED";
import { EvtMeta } from "../../@SHARED/evt";

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

export type Evt =
  | { t: "user-changed-mode"; mode: Mode; userId: UserId }
  | { t: "vs-bot"; c: VsBot.Evt }
  | { t: "vs-user"; c: VsUser.Evt };

export type State =
  | {
      t: "none";
    }
  | {
      t: "vs-user";
      c: VsUser.State;
    }
  | {
      t: "vs-bot";
      c: VsBot.State;
    };

export const initState = (): State => {
  return {
    t: "none",
  };
};

export const reducer = (
  ctx: SpaceCtx,
  state: State,
  evt: Evt & EvtMeta
): State => {
  if (evt.t === "user-changed-mode") {
    switch (evt.mode) {
      case "none": {
        return {
          t: "none",
        };
      }

      case "vs-bot": {
        return {
          t: "vs-bot",
          c: VsBot.initState(ctx),
        };
      }
      case "vs-user": {
        return {
          t: "vs-user",
          c: VsUser.initState(ctx),
        };
      }
    }
  }

  if (evt.t === "vs-bot" && state.t === "vs-bot") {
    return {
      t: "vs-bot",
      c: VsBot.reducer(state.c, { ...evt, ...evt.c }),
    };
  }

  if (evt.t === "vs-user" && state.t === "vs-user") {
    return {
      t: "vs-user",
      c: VsUser.reducer(state.c, { ...evt, ...evt.c }),
    };
  }

  return state;
};

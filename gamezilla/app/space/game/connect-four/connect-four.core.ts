import { UserId } from "gamezilla/app/@SHARED/data";
import { SpaceCtx } from "gamezilla/app/space/@SHARED";
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
  | { t: "vs-bot"; c: VsBot.ClientModel }
  | { t: "vs-user"; c: VsUser.ClientModel }
  | { t: null };

export type ServerModel =
  | { t: "vs-bot"; c: VsBot.ServerModel }
  | { t: "vs-user"; c: VsUser.ServerModel }
  | { t: null };

export type Mode = "none" | "vs-user" | "vs-bot";

//
//
//
// Msg
//
//
//

export type ClientMsg =
  | { t: "vs-user"; c: VsUser.ClientMsg }
  | { t: "vs-bot"; c: VsBot.ClientMsg };

export type ServerMsg =
  | { t: "vs-user"; c: VsUser.ServerMsg }
  | { t: "vs-bot"; c: VsBot.ServerMsg };

export type ToClient =
  | { t: "vs-user"; c: VsUser.ToClient }
  | { t: "vs-bot"; c: VsBot.ToClient };

export type ToServer =
  | { t: "vs-user"; c: VsUser.ToServer }
  | { t: "vs-bot"; c: VsBot.ToServer };

//
//
//
//
//

export type GameEvent =
  | { t: "user-changed-mode"; mode: Mode; userId: UserId }
  | { t: "vs-bot"; c: VsBot.GameEvent }
  | { t: "vs-user"; c: VsUser.GameEvent };

export type GameState =
  | {
      t: "none";
    }
  | {
      t: "vs-user";
      c: VsUser.GameState;
    }
  | {
      t: "vs-bot";
      c: VsBot.GameState;
    };

export const initState = (): GameState => {
  return {
    t: "none",
  };
};

export const reducer = ({
  ctx,
  event,
  state,
}: {
  ctx: SpaceCtx;
  state: GameState;
  event: GameEvent;
}): GameState => {
  if (event.t === "user-changed-mode") {
    switch (event.mode) {
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

  if (event.t === "vs-bot" && state.t === "vs-bot") {
    return {
      t: "vs-bot",
      c: VsBot.reducer(state.c, { ...event, ...event.c }),
    };
  }

  if (event.t === "vs-user" && state.t === "vs-user") {
    return {
      t: "vs-user",
      c: VsUser.reducer(state.c, { ...event, ...event.c }),
    };
  }

  return state;
};

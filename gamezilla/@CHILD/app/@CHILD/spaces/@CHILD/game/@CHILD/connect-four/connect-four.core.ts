import { WithEventMeta } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
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
  | GameEvent
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
  msgEvent,
  state,
}: {
  ctx: SpaceCtx;
  state: GameState;
  msgEvent: WithEventMeta<GameEvent>;
}): GameState => {
  switch (msgEvent.t) {
    case "user-changed-mode": {
      switch (msgEvent.mode) {
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

    case "vs-bot": {
      switch (state.t) {
        case "vs-bot": {
          return {
            t: "vs-bot",
            c: VsBot.reducer({
              modelGameState: state.c,
              msgGameEvent: { ...msgEvent, ...msgEvent.c },
            }),
          };
        }
        default: {
          return state;
        }
      }
    }

    case "vs-user": {
      switch (state.t) {
        case "vs-user": {
          return {
            t: "vs-user",
            c: VsUser.reducer(state.c, msgEvent.c),
          };
        }

        default: {
          return state;
        }
      }
    }
  }
};

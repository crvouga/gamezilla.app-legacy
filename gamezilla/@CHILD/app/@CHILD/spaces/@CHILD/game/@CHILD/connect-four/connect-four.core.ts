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

export type ModelClient =
  | { t: "vs-bot"; c: VsBot.ModelClient }
  | { t: "vs-user"; c: VsUser.ModelClient }
  | { t: null };

export type ModelServer =
  | { t: "vs-bot"; c: VsBot.ModelServer }
  | { t: "vs-user"; c: VsUser.ModelServer }
  | { t: null };

export type Mode = "none" | "vs-user" | "vs-bot";

//
//
//
// Msg
//
//
//

export type MsgClient =
  | MsgGame
  | { t: "vs-user"; c: VsUser.MsgClient }
  | { t: "vs-bot"; c: VsBot.MsgClient };

export type MsgServer =
  | { t: "vs-user"; c: VsUser.MsgServer }
  | { t: "vs-bot"; c: VsBot.MsgServer };

export type MsgToClient =
  | { t: "vs-user"; c: VsUser.MsgToClient }
  | { t: "vs-bot"; c: VsBot.MsgToClient };

export type MsgToServer =
  | { t: "vs-user"; c: VsUser.MsgToServer }
  | { t: "vs-bot"; c: VsBot.MsgToServer };

//
//
//
//
//

export type MsgGame =
  | { t: "user-changed-mode"; mode: Mode; userId: UserId }
  | { t: "vs-bot"; c: VsBot.MsgGame }
  | { t: "vs-user"; c: VsUser.MsgGame };

export type ModelGame =
  | {
      t: "none";
    }
  | {
      t: "vs-user";
      c: VsUser.ModelGame;
    }
  | {
      t: "vs-bot";
      c: VsBot.ModelGame;
    };

export const initGame = (): ModelGame => {
  return {
    t: "none",
  };
};

export const reducer = ({
  ctx,
  msgGame,
  modelGame,
}: {
  ctx: SpaceCtx;
  modelGame: ModelGame;
  msgGame: WithEventMeta<MsgGame>;
}): ModelGame => {
  switch (msgGame.t) {
    case "user-changed-mode": {
      switch (msgGame.mode) {
        case "none": {
          return {
            t: "none",
          };
        }

        case "vs-bot": {
          return {
            t: "vs-bot",
            c: VsBot.initGame(ctx),
          };
        }

        case "vs-user": {
          return {
            t: "vs-user",
            c: VsUser.initGame(ctx),
          };
        }
      }
    }

    case "vs-bot": {
      switch (modelGame.t) {
        case "vs-bot": {
          return {
            t: "vs-bot",
            c: VsBot.reducer({
              modelGame: modelGame.c,
              msgGame: { ...msgGame, ...msgGame.c },
            }),
          };
        }
        default: {
          return modelGame;
        }
      }
    }

    case "vs-user": {
      switch (modelGame.t) {
        case "vs-user": {
          return {
            t: "vs-user",
            c: VsUser.reducer(modelGame.c, msgGame.c),
          };
        }

        default: {
          return modelGame;
        }
      }
    }
  }
};

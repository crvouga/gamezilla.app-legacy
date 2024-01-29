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
  | MsgGame
  | { t: "vs-user"; c: VsUser.ClientMsg }
  | { t: "vs-bot"; c: VsBot.ClientMsg };

export type ServerMsg =
  | { t: "vs-user"; c: VsUser.ServerMsg }
  | { t: "vs-bot"; c: VsBot.ServerMsg };

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
  msgEvt,
  modelGame,
}: {
  ctx: SpaceCtx;
  modelGame: ModelGame;
  msgEvt: WithEventMeta<MsgGame>;
}): ModelGame => {
  switch (msgEvt.t) {
    case "user-changed-mode": {
      switch (msgEvt.mode) {
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
              msgGame: { ...msgEvt, ...msgEvt.c },
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
            c: VsUser.reducer(modelGame.c, msgEvt.c),
          };
        }

        default: {
          return modelGame;
        }
      }
    }
  }
};

import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-server";
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space-cmd";
import { Eff, Sub } from "gamezilla/@SHARED/core";
import * as Puzzle from "./@CHILD/puzzle/puzzle.server";
import * as VsBot from "./@CHILD/vs-bot/vs-bot.server";
import * as VsUser from "./@CHILD/vs-user/vs-user.server";
import {
  GameEvent,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./chess.core";

//
//
//
//
//
//
//

type Server = GameServer<{
  GameEvent: GameEvent;
  GameState: GameState;
  ServerModel: ServerModel;
  ServerMsg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
}>;

//
//
//
// Model
//
//
//

export const init: Server["init"] = async (input) => {
  if (input.model) {
    return { model: input.model };
  }
  return {
    model: { t: "none" },
  };
};

//
//
//
// Update
//
//
//

export const update: Server["update"] = async (input) => {
  return GameServer.chain(
    init(input),

    async (model) => {
      const { msg } = input;
      if (!msg) {
        return { model };
      }
      switch (model?.t) {
        case "none": {
          return { model };
        }

        case "vs-user": {
          if (msg?.t === "vs-user") {
            const updated = VsUser.update(msg.c, model.c);

            return {
              model: { t: "vs-user", c: updated.model },
            };
          }

          return { model };
        }

        case "vs-bot": {
          if (msg?.t === "vs-bot") {
            const updated = VsBot.update({
              msg: msg.c,
              model: model.c,
            });

            return {
              model: { t: "vs-bot", c: updated.model },
              eff: Eff.t("vs-bot", updated.eff),
            };
          }

          return { model };
        }

        case "puzzle": {
          if (msg?.t !== "puzzle") {
            return { model };
          }

          const updated = Puzzle.update({
            model: model.c,
            msg: msg.c,
            ctx: input.ctx,
          });

          return {
            model: { t: "puzzle", c: updated.model },
            eff: Eff.t("puzzle", updated.eff),
            cmd: SpaceServerCmd.tag("puzzle", updated.cmd),
          };
        }
      }
    }
  );
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Server["subscriptions"] = async (_input) => {
  return Sub.None;
};

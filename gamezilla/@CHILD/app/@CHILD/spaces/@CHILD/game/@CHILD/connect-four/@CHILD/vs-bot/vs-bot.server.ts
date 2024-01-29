import { GameServer } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server";
import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import {
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd";
import { Sub, Time, TimeSpan, isErr } from "gamezilla/@SHARED/core";
import { ConnectFourBotWorker } from "../../@SHARED/connect-four";
import * as ConnectFour from "../../@SHARED/connect-four/connect-four";
import {
  MsgGame,
  ModelGame,
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
  isBotMoving,
  isBotTurn,
  toBotPlayer,
} from "./vs-bot.core";

//
//
//
//
//
//
//

type Module = GameServerModule<{
  Model: ModelServer;
  Msg: MsgServer;
  MsgToClient: MsgToClient;
  MsgToServer: MsgToServer;
  ModelGame: ModelGame;
  MsgGame: MsgGame;
  Ctx: SpaceServerCtx;
  Deps: null;
  MsgInCmd: null;
  MsgInEvent: SpaceServerEvent;
  MsgOutCmd: SpaceServerCmd<MsgToClient>;
  MsgOutEvent: null;
}>;

export const init: Module["init"] = {
  botStartedFindingMoveAt: null,
};

export const update: Module["update"] = async (input) => {
  return GameServerModule.chainUpdates({ model: input.model }, (model) =>
    updateFromMsg({ ...input, model })
  );
};

const updateFromMsg: Module["update"] = async (input) => {
  const { msg, model, modelGame, ctx } = input;

  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "time-passed": {
      const shouldBotMove =
        isBotTurn(modelGame) && !isBotMoving(ctx.now, model);
      if (
        modelGame.type === "game" &&
        shouldBotMove &&
        msg.t === "time-passed"
      ) {
        return {
          model: {
            ...model,
            botStartedFindingMoveAt: ctx.now,
          },
          eff: async (dispatch) => {
            await new Promise((r) => setTimeout(r, 1000 / 4));
            const found = ConnectFourBotWorker.findBestMove({
              columns: modelGame.columns,
              maxDepth: 4,
              maximizingPlayer: toBotPlayer(modelGame),
            });
            dispatch({ t: "bot-found-best-move", found, startedAt: ctx.now });
          },
        };
      }

      return { model };
    }

    case "bot-found-best-move": {
      const { found } = msg;

      return GameServer.chain(
        { model },
        async (model) => {
          if (isErr(found)) {
            return { model };
          }

          const columnIndex = found.value.columnIndex;

          if (!ConnectFour.isColumnIndex(columnIndex)) {
            return { model };
          }

          const msgGameNew = withId<MsgGame>({
            t: "bot-dropped-disc",
            columnIndex,
          });

          return {
            model,
            msgGame: [msgGameNew],
          };
        },
        async (model) => {
          return { model: { ...model, botStartedFindingMoveAt: null } };
        }
      );
    }
  }
};

export const subscriptions: Module["subscriptions"] = async (input) => {
  if (isBotTurn(input.modelGame)) {
    return Time.interval(`vs-bot`, TimeSpan.fromSeconds(1 / 2), () => ({
      t: "time-passed",
    }));
  }
  return Sub.None;
};

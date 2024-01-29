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
  GameEvent,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
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
  Model: ServerModel;
  Msg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
  Ctx: SpaceServerCtx;
  Deps: null;
  InCmd: null;
  InEvent: SpaceServerEvent;
  OutCmd: SpaceServerCmd<ToClient>;
  OutEvent: null;
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
  const { msg, model, modelGameState, ctx } = input;

  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "time-passed": {
      const shouldBotMove =
        isBotTurn(modelGameState) && !isBotMoving(ctx.now, model);
      if (
        modelGameState.type === "game" &&
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
              columns: modelGameState.columns,
              maxDepth: 4,
              maximizingPlayer: toBotPlayer(modelGameState),
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

          const msgEventNew = withId<GameEvent>({
            t: "bot-dropped-disc",
            columnIndex,
          });

          return {
            model,
            msgGameEvent: [msgEventNew],
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
  if (isBotTurn(input.modelGameState)) {
    return Time.interval(`vs-bot`, TimeSpan.fromSeconds(1 / 2), () => ({
      t: "time-passed",
    }));
  }
  return Sub.None;
};

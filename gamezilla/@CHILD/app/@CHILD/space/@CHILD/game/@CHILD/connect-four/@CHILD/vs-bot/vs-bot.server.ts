import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { Time, TimeSpan, isErr } from "gamezilla/@SHARED/core";
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

type Server = GameServer<{
  ServerModel: ServerModel;
  ServerMsg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
}>;

export const init: Server["init"] = async ({ model }) => {
  if (model) {
    return { model };
  }
  return { model: { botStartedFindingMoveAt: null } };
};

export const update: Server["update"] = async (input) => {
  return GameServer.chain(
    await init(input),

    async (model) => {
      const { msg, state, ctx } = input;

      if (!msg) {
        return { model };
      }

      switch (msg.t) {
        case "bot-found-best-move": {
          const { found } = msg;

          if (isErr(found)) {
            return { model: { ...model, botStartedFindingMoveAt: null } };
          }

          const columnIndex = found.value.columnIndex;

          if (!ConnectFour.isColumnIndex(columnIndex)) {
            return { model: { ...model, botStartedFindingMoveAt: null } };
          }

          return {
            model: { ...model, botStartedFindingMoveAt: null },
            gameEvent: [{ t: "bot-dropped-disc", columnIndex }],
          };
        }

        case "time-passed": {
          if (
            state.type === "game" &&
            isBotTurn(state) &&
            !isBotMoving(ctx.now, model)
          ) {
            return {
              model: {
                ...model,
                botStartedFindingMoveAt: ctx.now,
              },
              eff: async (dispatch) => {
                await new Promise((r) => setTimeout(r, 1000));
                const found = ConnectFourBotWorker.findBestMove({
                  columns: state.columns,
                  maxDepth: 4,
                  maximizingPlayer: toBotPlayer(state),
                });
                dispatch({ t: "bot-found-best-move", found });
              },
            };
          }

          return { model };
        }
      }
    }
  );
};

export const subscriptions: Server["subscriptions"] = async (input) => {
  const intervalId = `${input.intervalId}/vs-bot`;

  return Time.interval(intervalId, TimeSpan.fromSeconds(1), () => ({
    t: "time-passed",
  }));
};

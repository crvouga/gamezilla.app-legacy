import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { Sub, isErr } from "gamezilla/@SHARED/core";
import { ConnectFourBotWorker } from "../../@SHARED/connect-four";
import * as ConnectFour from "../../@SHARED/connect-four/connect-four";
import {
  GameEvent,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
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
  return { model: { isBotFindingMove: false } };
};

export const update: Server["update"] = async (input) => {
  return GameServer.chain(
    await init(input),
    //
    async (model): ReturnType<Server["update"]> => {
      const { state, gameEvent } = input;
      if (!gameEvent) {
        return { model };
      }

      if (!isBotTurn(state)) {
        return { model };
      }

      if (model.isBotFindingMove) {
        return { model };
      }

      if (state.type !== "game") {
        return { model };
      }

      if (model.isBotFindingMove) {
        return { model };
      }

      return {
        model: {
          ...model,
          isBotFindingMove: true,
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
    },
    async (model) => {
      const { msg } = input;

      if (!msg) {
        return { model };
      }

      switch (msg.t) {
        case "bot-found-best-move": {
          const { found } = msg;

          if (isErr(found)) {
            return { model: { ...model, isBotFindingMove: false } };
          }

          const columnIndex = found.value.columnIndex;

          if (!ConnectFour.isColumnIndex(columnIndex)) {
            return { model: { ...model, isBotFindingMove: false } };
          }

          return {
            model: { ...model, isBotFindingMove: false },
            gameEvent: [{ t: "bot-dropped-disc", columnIndex }],
          };
        }
      }
    }
  );
};

export const subscriptions: Server["subscriptions"] = async (_input) => {
  return Sub.None;
};
